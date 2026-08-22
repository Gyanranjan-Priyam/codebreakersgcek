"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import {
  sendMemberInvitationEmail,
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

    const emailResults = await Promise.allSettled([
      sendMemberInvitationEmail({
        to: normalizedEmail,
        memberName: fullName,
        loginUrl: `${appUrl}/login`,
      }),
      sendMemberWelcomeEmail({
        to: normalizedEmail,
        memberName: fullName,
        dashboardUrl: `${appUrl}/login`,
      }),
    ]);

    const emailFailures = emailResults.filter((result) => result.status === "rejected");

    return {
      status: "success" as const,
      message:
        emailFailures.length > 0
          ? "Member added, but one or more emails could not be sent"
          : "Member added successfully and invitation emails sent",
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
