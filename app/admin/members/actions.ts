"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { revalidatePath } from "next/cache";
import {
  sendMemberWelcomeEmail,
} from "@/lib/mailer";
import { env } from "@/lib/env";
import { z } from "zod";

const CB_USER_ID_PREFIX = "GCEK-CB-";

export async function generateCbUserId(): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const candidateId = `${CB_USER_ID_PREFIX}${randomDigits}`;
    const existing = await prisma.user.findUnique({
      where: { cbUserId: candidateId },
      select: { id: true },
    });
    if (!existing) {
      return candidateId;
    }
  }
  throw new Error("Failed to generate a unique CB User ID");
}

export async function backfillMissingCbUserIds() {
  const usersToUpdate = await prisma.user.findMany({
    where: {
      OR: [
        { cbUserId: null },
        { cbUserId: { not: { startsWith: "GCEK-CB-" } } },
      ],
    },
    select: { id: true },
  });

  for (const user of usersToUpdate) {
    try {
      const newId = await generateCbUserId();
      await prisma.user.update({
        where: { id: user.id },
        data: { cbUserId: newId },
      });
    } catch (e) {
      console.error(`Error backfilling cbUserId for user ${user.id}:`, e);
    }
  }
}

export interface MemberData {
  id: string;
  cbUserId: string | null;
  name: string;
  email: string;
  username: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  registration: string | null;
  rollNumber: string | null;
  branch: string | null;
  batchId?: string | null;
  batch?: {
    id: string;
    name: string;
    code: string;
  } | null;
  mobileNumber: string | null;
  whatsappNumber: string | null;
  collegeName: string | null;
  state: string | null;
  district: string | null;
  createdAt: Date;
  emailVerified: boolean;
  banned: boolean | null;
  profileComplete: boolean;
  role: string | null;
}

const createMemberSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  whatsappNumber: z.string().min(10, "WhatsApp number is required"),
  branch: z.string().min(1, "Branch is required"),
  batchId: z.string().optional().nullable(),
});

export async function getAllMembers() {
  await requireAdmin();
  
  try {
    await backfillMissingCbUserIds();

    const members = await prisma.user.findMany({
      select: {
        id: true,
        cbUserId: true,
        name: true,
        email: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        batchId: true,
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        mobileNumber: true,
        whatsappNumber: true,
        collegeName: true,
        state: true,
        district: true,
        createdAt: true,
        emailVerified: true,
        banned: true,
        profileComplete: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: "success" as const,
      data: members,
    };
  } catch (error) {
    console.error("Error fetching members:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch members",
    };
  }
}

export async function createMember(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  branch: string;
  batchId?: string | null;
}) {
  await requireAdmin();

  try {
    const validation = createMemberSchema.safeParse(input);

    if (!validation.success) {
      return {
        status: "error" as const,
        message: validation.error.issues[0]?.message || "Invalid member data",
      };
    }

    const data = validation.data;
    const normalizedEmail = data.email.trim().toLowerCase();
    const fullName = [data.firstName.trim(), data.middleName?.trim(), data.lastName.trim()]
      .filter(Boolean)
      .join(" ");

    const existingMember = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingMember) {
      return {
        status: "error" as const,
        message: "A member with this email already exists",
      };
    }

    let member;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const cbUserId = await generateCbUserId();

      try {
        member = await prisma.user.create({
          data: {
            id: randomUUID(),
            cbUserId,
            name: fullName,
            email: normalizedEmail,
            firstName: data.firstName.trim(),
            middleName: data.middleName?.trim() || null,
            lastName: data.lastName.trim(),
            mobileNumber: data.mobileNumber.trim(),
            whatsappNumber: data.whatsappNumber.trim(),
            branch: data.branch,
            batchId: data.batchId || null,
            role: "member",
            emailVerified: false,
            profileComplete: false,
          },
          select: {
            id: true,
            cbUserId: true,
            name: true,
            email: true,
          },
        });
        break;
      } catch (error) {
        if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
          continue;
        }

        throw error;
      }
    }

    if (!member) {
      return {
        status: "error" as const,
        message: "Failed to assign a unique CB user ID",
      };
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

    let emailSent = true;
    try {
      await sendMemberWelcomeEmail({
        to: normalizedEmail,
        memberName: fullName,
        dashboardUrl: `${appUrl}/login`,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      emailSent = false;
    }

    return {
      status: "success" as const,
      message: emailSent
        ? "Member added successfully and welcome email sent"
        : "Member added, but welcome email could not be sent",
      data: member,
    };
  } catch (error) {
    console.error("Error creating member:", error);
    return {
      status: "error" as const,
      message: "Failed to add member",
    };
  }
}

export async function getMemberBySlugId(slugId: string) {
  await requireAdmin();
  
  try {
    // Normalize the slugId (trim whitespace)
    const normalizedSlugId = slugId.trim();
    
    // Strategy 1: Try exact match with case-insensitive search for username and registration
    let member = await prisma.user.findFirst({
      where: {
        OR: [
          { id: normalizedSlugId },
          { cbUserId: { equals: normalizedSlugId, mode: 'insensitive' } },
          { username: { equals: normalizedSlugId, mode: 'insensitive' } },
          { registration: { equals: normalizedSlugId, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        cbUserId: true,
        name: true,
        email: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        profileImageKey: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        mobileNumber: true,
        whatsappNumber: true,
        collegeName: true,
        collegeAddress: true,
        state: true,
        district: true,
        address: true,
        postOffice: true,
        policeStation: true,
        block: true,
        pinCode: true,
        aadhaarNumber: true,
        githubUsername: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        banned: true,
        banReason: true,
      },
    });

    // Strategy 2: If not found, try with lowercase conversion
    if (!member) {
      const lowercaseSlugId = normalizedSlugId.toLowerCase();
      member = await prisma.user.findFirst({
        where: {
          OR: [
            { cbUserId: { equals: lowercaseSlugId, mode: 'insensitive' } },
            { username: { equals: lowercaseSlugId, mode: 'insensitive' } },
            { registration: { equals: lowercaseSlugId, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          cbUserId: true,
          name: true,
          email: true,
          username: true,
          firstName: true,
          middleName: true,
          lastName: true,
          profileImageKey: true,
          registration: true,
          rollNumber: true,
          branch: true,
          admissionYear: true,
          mobileNumber: true,
          whatsappNumber: true,
          collegeName: true,
          collegeAddress: true,
          state: true,
          district: true,
          address: true,
          postOffice: true,
          policeStation: true,
          block: true,
          pinCode: true,
          aadhaarNumber: true,
          githubUsername: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          banned: true,
          banReason: true,
        },
      });
    }

    // Strategy 3: If still not found, try partial match on registration or username
    if (!member) {
      member = await prisma.user.findFirst({
        where: {
          OR: [
            { cbUserId: { contains: normalizedSlugId, mode: 'insensitive' } },
            { registration: { contains: normalizedSlugId, mode: 'insensitive' } },
            { username: { contains: normalizedSlugId, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          cbUserId: true,
          name: true,
          email: true,
          username: true,
          firstName: true,
          middleName: true,
          lastName: true,
          profileImageKey: true,
          registration: true,
          rollNumber: true,
          branch: true,
          admissionYear: true,
          mobileNumber: true,
          whatsappNumber: true,
          collegeName: true,
          collegeAddress: true,
          state: true,
          district: true,
          address: true,
          postOffice: true,
          policeStation: true,
          block: true,
          pinCode: true,
          aadhaarNumber: true,
          githubUsername: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          banned: true,
          banReason: true,
        },
      });
    }

    if (!member) {
      return {
        status: "error" as const,
        message: "Member not found",
      };
    }

    return {
      status: "success" as const,
      data: member,
    };
  } catch (error) {
    console.error("Error fetching member:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch member details",
    };
  }
}

export async function toggleMemberBan(id: string, reason?: string) {
  await requireAdmin();
  
  try {
    const member = await prisma.user.findUnique({
      where: { id },
      select: { banned: true },
    });

    if (!member) {
      return {
        status: "error" as const,
        message: "Member not found",
      };
    }

    const updatedMember = await prisma.user.update({
      where: { id },
      data: {
        banned: !member.banned,
        banReason: !member.banned ? reason : null,
      },
    });

    return {
      status: "success" as const,
      message: `Member ${updatedMember.banned ? 'banned' : 'unbanned'} successfully`,
      data: updatedMember,
    };
  } catch (error) {
    console.error("Error toggling member ban:", error);
    return {
      status: "error" as const,
      message: "Failed to update member status",
    };
  }
}

export async function deleteMember(id: string) {
  await requireAdmin();
  
  try {
    await prisma.user.delete({
      where: { id },
    });

    return {
      status: "success" as const,
      message: "Member deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting member:", error);
    return {
      status: "error" as const,
      message: "Failed to delete member",
    };
  }
}

export async function deleteMembers(ids: string[]) {
  await requireAdmin();

  try {
    const sanitizedIds = Array.from(
      new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))
    );

    if (sanitizedIds.length === 0) {
      return {
        status: "error" as const,
        message: "No members selected",
      };
    }

    const { count } = await prisma.user.deleteMany({
      where: {
        id: { in: sanitizedIds },
        role: { not: "admin" },
      },
    });

    if (count === 0) {
      return {
        status: "error" as const,
        message: "No members were deleted",
      };
    }

    return {
      status: "success" as const,
      message: `${count} member${count > 1 ? "s" : ""} deleted successfully`,
      data: { deletedCount: count },
    };
  } catch (error) {
    console.error("Error deleting members:", error);
    return {
      status: "error" as const,
      message: "Failed to delete selected members",
    };
  }
}

export async function getMembersStats() {
  await requireAdmin();
  
  try {
    const [totalMembers, verifiedMembers, bannedMembers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: true, profileComplete: true } }),
      prisma.user.count({ where: { banned: true } }),
    ]);

    return {
      status: "success" as const,
      data: {
        totalMembers,
        verifiedMembers,
        bannedMembers,
      },
    };
  } catch (error) {
    console.error("Error fetching members stats:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch statistics",
    };
  }
}

export async function getMemberStats(userId: string) {
  await requireAdmin();
  
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Get all attendance points
    const attendanceRecords = await prisma.attendance.findMany({
      where: { userId },
      include: { session: true },
    });
    const attendancePoints = attendanceRecords.reduce((sum, record) => sum + (record.points || 0), 0);
    const monthlyAttendance = attendanceRecords.filter(r => 
      r.session.date >= monthStart && r.session.date <= monthEnd
    ).reduce((sum, record) => sum + (record.points || 0), 0);

    // Get all task points
    const taskSubmissions = await prisma.taskSubmission.findMany({
      where: { userId, status: "approved" },
      include: { task: true },
    });
    const taskPoints = taskSubmissions.reduce((sum, sub) => sum + (sub.pointsAwarded || 0), 0);
    const monthlyTasks = taskSubmissions.filter(s => 
      s.evaluatedAt && s.evaluatedAt >= monthStart && s.evaluatedAt <= monthEnd
    ).reduce((sum, sub) => sum + (sub.pointsAwarded || 0), 0);

    // Get all event points
    const participations = await prisma.eventParticipation.findMany({
      where: { userId, status: "approved" },
      include: { event: true },
    });
    const eventPoints = participations.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);
    const monthlyEvents = participations.filter(p => 
      p.evaluatedAt && p.evaluatedAt >= monthStart && p.evaluatedAt <= monthEnd
    ).reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

    // Get quiz points
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { 
        userId,
        completedAt: { not: null },
      },
    });
    const quizPoints = quizAttempts.reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0);
    const monthlyQuiz = quizAttempts.filter(a => 
      a.completedAt && a.completedAt >= monthStart && a.completedAt <= monthEnd
    ).reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0);

    const totalPoints = attendancePoints + taskPoints + eventPoints + quizPoints;
    const monthlyPoints = monthlyAttendance + monthlyTasks + monthlyEvents + monthlyQuiz;

    // Get overall ranking - simplified approach
    const allUsers = await prisma.user.findMany({
      where: { 
        profileComplete: true,
        role: { not: "admin" },
      },
      select: { id: true },
    });

    // Calculate points for all users (simplified)
    const userPointsPromises = allUsers.map(async (user) => {
      const userAttendance = await prisma.attendance.findMany({
        where: { userId: user.id },
      });
      const userTasks = await prisma.taskSubmission.findMany({
        where: { userId: user.id, status: "approved" },
      });
      const userEvents = await prisma.eventParticipation.findMany({
        where: { userId: user.id, status: "approved" },
      });
      const userQuizzes = await prisma.quizAttempt.findMany({
        where: { userId: user.id, completedAt: { not: null } },
      });

      const userTotal = 
        userAttendance.reduce((sum, r) => sum + (r.points || 0), 0) +
        userTasks.reduce((sum, s) => sum + (s.pointsAwarded || 0), 0) +
        userEvents.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0) +
        userQuizzes.reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0);

      return { userId: user.id, points: userTotal };
    });

    const userPointsMap = await Promise.all(userPointsPromises);
    const sortedUsers = userPointsMap.sort((a, b) => b.points - a.points);
    const currentRanking = sortedUsers.findIndex(u => u.userId === userId) + 1;

    // Get monthly ranking - simplified
    const monthlyUserPointsPromises = allUsers.map(async (user) => {
      const userMonthlyAttendance = (await prisma.attendance.findMany({
        where: { userId: user.id },
        include: { session: true },
      })).filter(r => r.session.date >= monthStart && r.session.date <= monthEnd)
        .reduce((sum, r) => sum + (r.points || 0), 0);

      const userMonthlyTasks = (await prisma.taskSubmission.findMany({
        where: { userId: user.id, status: "approved" },
      })).filter(s => s.evaluatedAt && s.evaluatedAt >= monthStart && s.evaluatedAt <= monthEnd)
        .reduce((sum, s) => sum + (s.pointsAwarded || 0), 0);

      const userMonthlyEvents = (await prisma.eventParticipation.findMany({
        where: { userId: user.id, status: "approved" },
      })).filter(p => p.evaluatedAt && p.evaluatedAt >= monthStart && p.evaluatedAt <= monthEnd)
        .reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

      const userMonthlyQuiz = (await prisma.quizAttempt.findMany({
        where: { userId: user.id, completedAt: { not: null } },
      })).filter(a => a.completedAt && a.completedAt >= monthStart && a.completedAt <= monthEnd)
        .reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0);

      const monthTotal = userMonthlyAttendance + userMonthlyTasks + userMonthlyEvents + userMonthlyQuiz;
      return { userId: user.id, points: monthTotal };
    });

    const monthlyUserPoints = await Promise.all(monthlyUserPointsPromises);
    const sortedMonthlyUsers = monthlyUserPoints.sort((a, b) => b.points - a.points);
    const monthlyRanking = sortedMonthlyUsers.findIndex(u => u.userId === userId) + 1;

    return {
      status: "success" as const,
      data: {
        totalPoints,
        currentRanking,
        totalMembers: allUsers.length,
        monthlyPoints,
        monthlyRanking,
        attendancePoints,
        taskPoints,
        eventPoints,
        quizPoints,
      },
    };
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch member statistics",
    };
  }
}

export async function assignMemberBatch(userId: string, batchId: string | null) {
  await requireAdmin();
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { batchId: batchId || null },
      include: {
        batch: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    revalidatePath("/admin/members");
    revalidatePath("/admin/batches");
    return {
      status: "success" as const,
      message: batchId
        ? `Assigned to batch "${updated.batch?.name}".`
        : "Removed from batch.",
      data: updated,
    };
  } catch (error) {
    console.error("Error updating member batch:", error);
    return {
      status: "error" as const,
      message: "Failed to update member batch",
    };
  }
}

export async function bulkAssignMembersBatch(userIds: string[], batchId: string | null) {
  await requireAdmin();
  try {
    if (!userIds.length) {
      return { status: "error" as const, message: "No members selected" };
    }

    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { batchId: batchId || null },
    });

    revalidatePath("/admin/members");
    revalidatePath("/admin/batches");
    return {
      status: "success" as const,
      message: `Updated batch for ${userIds.length} member(s).`,
    };
  } catch (error) {
    console.error("Error bulk updating member batches:", error);
    return {
      status: "error" as const,
      message: "Failed to bulk update batches",
    };
  }
}

export interface FormCandidateItem {
  id: string;
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  branch: string;
  rollNumber: string;
  admissionYear: string;
  isAlreadyMember: boolean;
  submittedAt: Date;
}

export async function getFormsListForMemberImport() {
  await requireAdmin();
  try {
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        formId: true,
        title: true,
        _count: {
          select: { responses: true },
        },
      },
    });
    return forms.map((f) => ({
      id: f.id,
      formId: f.formId,
      title: f.title,
      responseCount: f._count.responses,
    }));
  } catch (error) {
    console.error("Error fetching forms for member import:", error);
    return [];
  }
}

function extractCandidateFromResponse(
  res: {
    id: string;
    answers: unknown;
    createdAt: Date;
    form?: { id?: string; title?: string; formId?: string; definition?: unknown } | null;
  },
  existingEmails: Set<string>,
  existingRolls: Set<string>
): FormCandidateItem & { formTitle?: string } {
  const answers = (res.answers || {}) as Record<string, unknown>;

  // Build field label map if form definition exists
  const fieldLabelMap = new Map<string, string>();
  if (res.form?.definition) {
    try {
      const def = res.form.definition as {
        sections?: {
          fields?: {
            id: string;
            label: string;
            type?: string;
            subQuestions?: { id: string; label: string }[];
          }[];
        }[];
      };
      if (def?.sections) {
        for (const section of def.sections) {
          for (const field of section.fields || []) {
            if (field.id && field.label) {
              fieldLabelMap.set(field.id, field.label);
            }
            if (field.subQuestions) {
              for (const sub of field.subQuestions) {
                if (sub.id && sub.label) {
                  fieldLabelMap.set(sub.id, sub.label);
                }
              }
            }
          }
        }
      }
    } catch {
      // Ignore definition parsing issues
    }
  }

  // Flatten answers (including multi_input and nested objects)
  const flattened: { key: string; label: string; value: string }[] = [];
  for (const [k, v] of Object.entries(answers)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      for (const [subK, subV] of Object.entries(v as Record<string, unknown>)) {
        if (subV !== null && subV !== undefined) {
          const valStr = String(subV).trim();
          const label = fieldLabelMap.get(subK) || fieldLabelMap.get(k) || subK;
          flattened.push({ key: subK, label, value: valStr });
        }
      }
    } else {
      const valStr = String(v).trim();
      const label = fieldLabelMap.get(k) || k;
      flattened.push({ key: k, label, value: valStr });
    }
  }

  let rawName = "";
  let rawEmail = "";
  let rawMobile = "";
  let rawWhatsapp = "";
  let rawBranch = "";
  let rawRoll = "";
  let rawYear = "";

  for (const item of flattened) {
    const k = (item.key + " " + item.label).toLowerCase();
    const v = item.value;
    if (!v) continue;

    // Email
    if (!rawEmail && (k.includes("email") || k.includes("mail") || (v.includes("@") && v.includes(".")))) {
      rawEmail = v;
    }
    // WhatsApp Number (prioritize explicit WhatsApp labels)
    else if (!rawWhatsapp && (k.includes("whatsapp") || k.includes("wa number") || k.includes("watsapp") || k.includes("wp number"))) {
      rawWhatsapp = v;
    }
    // Mobile / Phone / Contact
    else if (!rawMobile && (k.includes("mobile") || k.includes("phone") || k.includes("contact") || k.includes("calling") || k.includes("cell") || k.includes("tel") || k.includes("number"))) {
      rawMobile = v;
    }
    // Name
    else if (!rawName && (k.includes("name") || k.includes("fullname") || k.includes("applicant") || k.includes("student"))) {
      rawName = v;
    }
    // Branch
    else if (!rawBranch && (k.includes("branch") || k.includes("dept") || k.includes("department") || k.includes("stream"))) {
      rawBranch = v;
    }
    // Roll / Registration
    else if (!rawRoll && (k.includes("roll") || k.includes("registration") || k.includes("reg_no") || k.includes("regd") || k.includes("sic"))) {
      rawRoll = v;
    }
    // Year
    else if (!rawYear && (k.includes("year") || k.includes("batch") || k.includes("admission"))) {
      rawYear = v;
    }
  }

  // Fallback: Pattern matching for 10-12 digit mobile numbers if not matched by label
  if (!rawMobile) {
    for (const item of flattened) {
      const cleanDigits = item.value.replace(/\D/g, "");
      if (cleanDigits.length === 10 || (cleanDigits.length === 12 && cleanDigits.startsWith("91"))) {
        rawMobile = item.value;
        break;
      }
    }
  }

  // Clean phone numbers: normalize to 10 digits when prefixed with +91 or 91
  if (rawMobile) {
    rawMobile = rawMobile.replace(/[^\d+]/g, "").trim();
    if (rawMobile.startsWith("+91") && rawMobile.length === 13) {
      rawMobile = rawMobile.slice(3);
    } else if (rawMobile.startsWith("91") && rawMobile.length === 12) {
      rawMobile = rawMobile.slice(2);
    }
  }

  if (rawWhatsapp) {
    rawWhatsapp = rawWhatsapp.replace(/[^\d+]/g, "").trim();
    if (rawWhatsapp.startsWith("+91") && rawWhatsapp.length === 13) {
      rawWhatsapp = rawWhatsapp.slice(3);
    } else if (rawWhatsapp.startsWith("91") && rawWhatsapp.length === 12) {
      rawWhatsapp = rawWhatsapp.slice(2);
    }
  } else if (rawMobile) {
    rawWhatsapp = rawMobile;
  }

  // Name splitting
  let firstName = "";
  let middleName = "";
  let lastName = "";
  if (rawName) {
    const parts = rawName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      firstName = parts[0];
      lastName = "";
    } else if (parts.length === 2) {
      firstName = parts[0];
      lastName = parts[1];
    } else {
      firstName = parts[0];
      middleName = parts.slice(1, -1).join(" ");
      lastName = parts[parts.length - 1];
    }
  }

  // Branch normalization
  let branch = "";
  if (rawBranch) {
    const upper = rawBranch.toUpperCase();
    if (upper.includes("CSE") || upper.includes("COMPUTER")) branch = "CSE";
    else if (upper.includes("ECE") || upper.includes("ELECTRONICS") || upper.includes("ETC")) branch = "ECE";
    else if (upper.includes("EE") || upper.includes("ELECTRICAL")) branch = "EE";
    else if (upper.includes("ME") || upper.includes("MECHANICAL")) branch = "ME";
    else if (upper.includes("CE") || upper.includes("CIVIL")) branch = "CE";
    else branch = upper.slice(0, 10);
  }

  const isAlreadyMember =
    (rawEmail && existingEmails.has(rawEmail.toLowerCase())) ||
    (rawRoll && existingRolls.has(rawRoll.toLowerCase())) ||
    false;

  return {
    id: res.id,
    name: rawName || "Unnamed Applicant",
    firstName,
    middleName,
    lastName,
    email: rawEmail,
    mobileNumber: rawMobile,
    whatsappNumber: rawWhatsapp,
    branch,
    rollNumber: rawRoll,
    admissionYear: rawYear,
    isAlreadyMember,
    submittedAt: res.createdAt,
    formTitle: res.form?.title,
  };
}

export async function getFormCandidatesForMemberImport(formId: string): Promise<FormCandidateItem[]> {
  await requireAdmin();
  try {
    const form = await prisma.form.findFirst({
      where: {
        OR: [{ id: formId }, { formId: formId }],
      },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!form || !form.responses.length) {
      return [];
    }

    const existingUsers = await prisma.user.findMany({
      select: { email: true, rollNumber: true },
    });
    const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));
    const existingRolls = new Set(
      existingUsers.filter((u) => u.rollNumber).map((u) => u.rollNumber!.toLowerCase().trim())
    );

    return form.responses.map((res) =>
      extractCandidateFromResponse(
        { ...res, form: { id: form.id, title: form.title, formId: form.formId, definition: form.definition } },
        existingEmails,
        existingRolls
      )
    );
  } catch (error) {
    console.error("Error fetching form candidates:", error);
    return [];
  }
}

export async function getFormCandidateByResponseId(identifier: string): Promise<{
  success: boolean;
  data?: FormCandidateItem & { formTitle?: string };
  error?: string;
}> {
  await requireAdmin();
  try {
    let cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, error: "Response ID is required." };
    }

    if (cleanId.startsWith("#")) {
      cleanId = cleanId.slice(1).trim();
    }

    let res = await prisma.formResponse.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { transactionId: cleanId },
          { id: { equals: cleanId, mode: "insensitive" } },
          { transactionId: { equals: cleanId, mode: "insensitive" } },
          { id: { startsWith: cleanId, mode: "insensitive" } },
          { transactionId: { startsWith: cleanId, mode: "insensitive" } },
          { id: { contains: cleanId, mode: "insensitive" } },
          { transactionId: { contains: cleanId, mode: "insensitive" } },
        ],
      },
      include: {
        form: {
          select: { id: true, title: true, formId: true, definition: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fallback: search across recent responses if cleanId is email, roll, phone, or name
    if (!res) {
      const recentResponses = await prisma.formResponse.findMany({
        take: 300,
        orderBy: { createdAt: "desc" },
        include: {
          form: {
            select: { id: true, title: true, formId: true, definition: true },
          },
        },
      });

      const q = cleanId.toLowerCase();
      res =
        recentResponses.find((r) => {
          if (r.id.toLowerCase().includes(q) || (r.transactionId && r.transactionId.toLowerCase().includes(q))) {
            return true;
          }
          const ansStr = JSON.stringify(r.answers || {}).toLowerCase();
          return ansStr.includes(q);
        }) || null;
    }

    if (!res) {
      return { success: false, error: `No form response found matching: "${identifier.trim()}"` };
    }

    const existingUsers = await prisma.user.findMany({
      select: { email: true, rollNumber: true },
    });
    const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));
    const existingRolls = new Set(
      existingUsers.filter((u) => u.rollNumber).map((u) => u.rollNumber!.toLowerCase().trim())
    );

    const candidate = extractCandidateFromResponse(res, existingEmails, existingRolls);
    return {
      success: true,
      data: candidate,
    };
  } catch (error) {
    console.error("Error fetching form response by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch response.",
    };
  }
}

