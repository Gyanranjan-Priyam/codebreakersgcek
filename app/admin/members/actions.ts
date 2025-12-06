"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export interface MemberData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  registration: string | null;
  rollNumber: string | null;
  branch: string | null;
  mobileNumber: string | null;
  collegeName: string | null;
  state: string | null;
  district: string | null;
  createdAt: Date;
  emailVerified: boolean;
  banned: boolean | null;
}

export async function getAllMembers() {
  await requireAdmin();
  
  try {
    const members = await prisma.user.findMany({
      where: {
        profileComplete: true, // Only show completed profiles
        role: { not: "admin" }, // Exclude admin users
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        registration: true,
        rollNumber: true,
        branch: true,
        mobileNumber: true,
        collegeName: true,
        state: true,
        district: true,
        createdAt: true,
        emailVerified: true,
        banned: true,
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
          { username: { equals: normalizedSlugId, mode: 'insensitive' } },
          { registration: { equals: normalizedSlugId, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
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
            { username: { equals: lowercaseSlugId, mode: 'insensitive' } },
            { registration: { equals: lowercaseSlugId, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
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
            { registration: { contains: normalizedSlugId, mode: 'insensitive' } },
            { username: { contains: normalizedSlugId, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
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

export async function getMembersStats() {
  await requireAdmin();
  
  try {
    const [totalMembers, verifiedMembers, bannedMembers] = await Promise.all([
      prisma.user.count({ where: { profileComplete: true, role: { not: "admin" } } }),
      prisma.user.count({ where: { emailVerified: true, profileComplete: true, role: { not: "admin" } } }),
      prisma.user.count({ where: { banned: true, profileComplete: true, role: { not: "admin" } } }),
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
