"use server";

import { prisma } from "@/lib/db";

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  username: string | null;
  registration: string | null;
  branch: string | null;
  admissionYear: string | null;
  totalPoints: number;
  attendancePoints: number;
  taskPoints: number;
  eventPoints: number;
  quizPoints: number;
  sessionsAttended: number;
  tasksCompleted: number;
  eventsParticipated: number;
  quizzesTaken: number;
}

export async function getOverallLeaderboard() {
  try {
    // Get all eligible users
    const users = await prisma.user.findMany({
      where: {
        profileComplete: true,
        role: { not: "admin" },
      },
      select: {
        id: true,
        name: true,
        username: true,
        registration: true,
        branch: true,
        admissionYear: true,
      },
    });

    // Get attendance points
    const attendanceData = await prisma.attendance.groupBy({
      by: ['userId'],
      _sum: {
        points: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: 'present',
        userId: { in: users.map(u => u.id) },
      },
    });

    // Get task points
    const taskData = await prisma.taskSubmission.groupBy({
      by: ['userId'],
      _sum: {
        pointsAwarded: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: 'approved',
        userId: { in: users.map(u => u.id) },
      },
    });

    // Get event points
    const eventData = await prisma.eventParticipation.groupBy({
      by: ['userId'],
      _sum: {
        pointsAwarded: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: 'approved',
        userId: { in: users.map(u => u.id) },
      },
    });

    // Get approved quiz points
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
      },
      select: {
        userId: true,
        pointsEarned: true,
        answersJson: true,
      },
    });

    // Filter only approved attempts and group by user
    const quizData = quizAttempts.reduce((acc, attempt) => {
      // Check if approved
      let isApproved = false;
      if (attempt.answersJson) {
        try {
          const answersData = JSON.parse(attempt.answersJson);
          isApproved = answersData.approvalStatus === 'approved';
        } catch (e) {
          // Not approved if can't parse
        }
      }

      if (!isApproved) return acc;

      const existing = acc.get(attempt.userId);
      if (existing) {
        existing._sum.pointsEarned += attempt.pointsEarned;
        existing._count._all += 1;
      } else {
        acc.set(attempt.userId, {
          userId: attempt.userId,
          _sum: { pointsEarned: attempt.pointsEarned },
          _count: { _all: 1 },
        });
      }
      return acc;
    }, new Map());

    // Create maps for quick lookup
    const attendanceMap = new Map(attendanceData.map(a => [a.userId, a]));
    const taskMap = new Map(taskData.map(t => [t.userId, t]));
    const eventMap = new Map(eventData.map(e => [e.userId, e]));

    // Build leaderboard with all points
    const leaderboard: LeaderboardEntry[] = users
      .map(user => {
        const attendance = attendanceMap.get(user.id);
        const tasks = taskMap.get(user.id);
        const events = eventMap.get(user.id);
        const quizzes = quizData.get(user.id);

        const attendancePoints = attendance?._sum.points || 0;
        const taskPoints = tasks?._sum.pointsAwarded || 0;
        const eventPoints = events?._sum.pointsAwarded || 0;
        const quizPoints = quizzes?._sum.pointsEarned || 0;
        const totalPoints = attendancePoints + taskPoints + eventPoints + quizPoints;

        return {
          userId: user.id,
          userName: user.name,
          username: user.username,
          registration: user.registration,
          branch: user.branch,
          admissionYear: user.admissionYear,
          totalPoints,
          attendancePoints,
          taskPoints,
          eventPoints,
          quizPoints,
          sessionsAttended: attendance?._count._all || 0,
          tasksCompleted: tasks?._count._all || 0,
          eventsParticipated: events?._count._all || 0,
          quizzesTaken: quizzes?._count._all || 0,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return {
      status: "success" as const,
      data: leaderboard,
    };
  } catch (error) {
    console.error("Error fetching overall leaderboard:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch leaderboard",
    };
  }
}

export async function getMonthlyLeaderboard(year: number, month: number) {
  try {
    // Calculate start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all eligible users
    const users = await prisma.user.findMany({
      where: {
        profileComplete: true,
        role: { not: "admin" },
      },
      select: {
        id: true,
        name: true,
        username: true,
        registration: true,
        branch: true,
        admissionYear: true,
      },
    });

    const userIds = users.map(u => u.id);

    // Get attendance sessions in this month
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
      },
    });

    const sessionIds = sessions.map(s => s.id);

    // Get attendance points for this month
    const attendanceData = await prisma.attendance.groupBy({
      by: ['userId'],
      _sum: {
        points: true,
      },
      _count: {
        _all: true,
      },
      where: {
        sessionId: { in: sessionIds },
        status: 'present',
        userId: { in: userIds },
      },
    });

    // Get task submissions evaluated in this month
    const taskData = await prisma.taskSubmission.groupBy({
      by: ['userId'],
      _sum: {
        pointsAwarded: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: 'approved',
        evaluatedAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { in: userIds },
      },
    });

    // Get event participations evaluated in this month
    const eventData = await prisma.eventParticipation.groupBy({
      by: ['userId'],
      _sum: {
        pointsAwarded: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: 'approved',
        evaluatedAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { in: userIds },
      },
    });

    // Get approved quiz attempts completed in this month
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: { in: userIds },
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
        pointsEarned: true,
        answersJson: true,
      },
    });

    // Filter only approved attempts and group by user
    const quizData = quizAttempts.reduce((acc, attempt) => {
      // Check if approved
      let isApproved = false;
      if (attempt.answersJson) {
        try {
          const answersData = JSON.parse(attempt.answersJson);
          isApproved = answersData.approvalStatus === 'approved';
        } catch (e) {
          // Not approved if can't parse
        }
      }

      if (!isApproved) return acc;

      const existing = acc.get(attempt.userId);
      if (existing) {
        existing._sum.pointsEarned += attempt.pointsEarned;
        existing._count._all += 1;
      } else {
        acc.set(attempt.userId, {
          userId: attempt.userId,
          _sum: { pointsEarned: attempt.pointsEarned },
          _count: { _all: 1 },
        });
      }
      return acc;
    }, new Map());

    // Create maps for quick lookup
    const attendanceMap = new Map(attendanceData.map(a => [a.userId, a]));
    const taskMap = new Map(taskData.map(t => [t.userId, t]));
    const eventMap = new Map(eventData.map(e => [e.userId, e]));

    // Build leaderboard with all points
    const leaderboard: LeaderboardEntry[] = users
      .map(user => {
        const attendance = attendanceMap.get(user.id);
        const tasks = taskMap.get(user.id);
        const events = eventMap.get(user.id);
        const quizzes = quizData.get(user.id);

        const attendancePoints = attendance?._sum.points || 0;
        const taskPoints = tasks?._sum.pointsAwarded || 0;
        const eventPoints = events?._sum.pointsAwarded || 0;
        const quizPoints = quizzes?._sum.pointsEarned || 0;
        const totalPoints = attendancePoints + taskPoints + eventPoints + quizPoints;

        return {
          userId: user.id,
          userName: user.name,
          username: user.username,
          registration: user.registration,
          branch: user.branch,
          admissionYear: user.admissionYear,
          totalPoints,
          attendancePoints,
          taskPoints,
          eventPoints,
          quizPoints,
          sessionsAttended: attendance?._count._all || 0,
          tasksCompleted: tasks?._count._all || 0,
          eventsParticipated: events?._count._all || 0,
          quizzesTaken: quizzes?._count._all || 0,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return {
      status: "success" as const,
      data: leaderboard,
    };
  } catch (error) {
    console.error("Error fetching monthly leaderboard:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch monthly leaderboard",
    };
  }
}
