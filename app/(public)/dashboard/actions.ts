"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export interface DashboardStats {
  totalPoints: number;
  pendingTasks: number;
  activeQuizzes: number;
  upcomingEvents: number;
  openTickets: number;
  totalAnnouncements: number;
}

export interface RecentActivity {
  id: string;
  type: 'announcement' | 'task' | 'event' | 'quiz' | 'ticket';
  title: string;
  description: string;
  date: Date;
  status?: string;
  points?: number;
}

export async function getUserDashboardData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    const userId = session.user.id;

    // Parallel data fetching for performance
    const [
      announcements,
      attendancePoints,
      taskSubmissions,
      eventParticipations,
      quizAttempts,
      pendingTasksCount,
      activeQuizzesCount,
      upcomingEventsCount,
      openTicketsCount,
      recentTickets
    ] = await Promise.all([
      // 1. Announcements
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        where: { isDeleted: false }
      }),
      // 2. Attendance Points
      prisma.attendance.aggregate({
        where: { userId, status: 'present' },
        _sum: { points: true }
      }),
      // 3. Task Submissions (Points & Recent)
      prisma.taskSubmission.findMany({
        where: { userId },
        include: { task: true },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      // 4. Event Participations (Points & Recent)
      prisma.eventParticipation.findMany({
        where: { userId },
        include: { event: true },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      // 5. Quiz Attempts (Points & Recent)
      prisma.quizAttempt.findMany({
        where: { userId },
        include: { quiz: true },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      // 6. Pending Tasks Count
      prisma.task.count({
        where: {
          dueDate: { gte: new Date() },
          submissions: { none: { userId } }
        }
      }),
      // 7. Active Quizzes Count
      prisma.quiz.count({
        where: {
          isActive: true,
          OR: [
            { endDateTime: null },
            { endDateTime: { gte: new Date() } }
          ],
          attempts: { none: { userId } }
        }
      }),
      // 8. Upcoming Events Count
      prisma.eventPoint.count({
        where: {
          eventDate: { gte: new Date() }
        }
      }),
      // 9. Open Tickets Count
      prisma.supportTicket.count({
        where: {
          userId,
          status: { in: ['OPEN', 'IN_PROGRESS'] }
        }
      }),
      // 10. Recent Tickets
      prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3
      })
    ]);

    // Calculate Total Points
    const totalPoints = 
      (attendancePoints._sum.points || 0) +
      taskSubmissions.reduce((acc, curr) => acc + (curr.pointsAwarded || 0), 0) +
      eventParticipations.reduce((acc, curr) => acc + (curr.pointsAwarded || 0), 0) +
      quizAttempts.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);

    // Aggregate Recent Activities
    const activities: RecentActivity[] = [
      ...announcements.map(a => ({
        id: `ann-${a.id}`,
        type: 'announcement' as const,
        title: a.title,
        description: a.description.substring(0, 100), // Truncate if needed
        date: a.createdAt,
      })),
      ...taskSubmissions.map(t => ({
        id: `task-${t.id}`,
        type: 'task' as const,
        title: `Task: ${t.task.title}`,
        description: `Status: ${t.status}`,
        date: t.updatedAt,
        status: t.status,
        points: t.pointsAwarded
      })),
      ...eventParticipations.map(e => ({
        id: `event-${e.id}`,
        type: 'event' as const,
        title: `Event: ${e.event.title}`,
        description: `Status: ${e.status}`,
        date: e.updatedAt,
        status: e.status,
        points: e.pointsAwarded
      })),
      ...quizAttempts.map(q => ({
        id: `quiz-${q.id}`,
        type: 'quiz' as const,
        title: `Quiz: ${q.quiz.title}`,
        description: `Score: ${q.score}/${q.totalQuestions}`,
        date: q.updatedAt,
        points: q.pointsEarned
      })),
      ...recentTickets.map(t => ({
        id: `ticket-${t.id}`,
        type: 'ticket' as const,
        title: `Support Ticket: ${t.subject}`,
        description: `Status: ${t.status}`,
        date: t.updatedAt,
        status: t.status
      }))
    ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

    const stats: DashboardStats = {
      totalPoints,
      pendingTasks: pendingTasksCount,
      activeQuizzes: activeQuizzesCount,
      upcomingEvents: upcomingEventsCount,
      openTickets: openTicketsCount,
      totalAnnouncements: announcements.length // Just for this batch, or could fetch total count if needed
    };

    // Fetch complete user profile for profile completion calculation
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        profileImageKey: true,
        emailVerified: true,
        createdAt: true,
        mobileNumber: true,
        whatsappNumber: true,
        state: true,
        district: true,
        collegeName: true,
        username: true,
        firstName: true,
        lastName: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        address: true,
        pinCode: true,
        githubUsername: true,
        profileComplete: true,
      }
    });

    return {
      status: "success" as const,
      data: {
        stats,
        recentActivities: activities,
        user: userProfile || {
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || null,
          profileImageKey: null,
          emailVerified: false,
          createdAt: new Date(),
          mobileNumber: null,
          whatsappNumber: null,
          state: null,
          district: null,
          collegeName: null,
          username: null,
          firstName: null,
          lastName: null,
          registration: null,
          rollNumber: null,
          branch: null,
          admissionYear: null,
          address: null,
          pinCode: null,
          githubUsername: null,
          profileComplete: false,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch dashboard data",
    };
  }
}