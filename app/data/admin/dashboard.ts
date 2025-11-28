import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function getDashboardStats() {
    await requireAdmin();
    
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        // Get user stats
        const [
            totalUsers,
            verifiedUsers,
            bannedUsers,
            newUsersThisMonth,
        ] = await Promise.all([
            prisma.user.count({ where: { role: { not: "admin" } } }),
            prisma.user.count({ where: { emailVerified: true, role: { not: "admin" } } }),
            prisma.user.count({ where: { banned: true, role: { not: "admin" } } }),
            prisma.user.count({ 
                where: { 
                    createdAt: { gte: monthStart, lte: monthEnd },
                    role: { not: "admin" }
                } 
            }),
        ]);

        // Get announcements stats
        const [totalAnnouncements, activeAnnouncements] = await Promise.all([
            prisma.announcement.count({ where: { isDeleted: false } }),
            prisma.announcement.count({ 
                where: { 
                    isDeleted: false,
                    createdAt: { gte: monthStart, lte: monthEnd }
                } 
            }),
        ]);

        // Get quizzes stats
        const [totalQuizzes, activeQuizzes, totalQuizAttempts] = await Promise.all([
            prisma.quiz.count(),
            prisma.quiz.count({ 
                where: { 
                    isActive: true,
                    OR: [
                        { endDateTime: null },
                        { endDateTime: { gte: currentDate } }
                    ]
                } 
            }),
            prisma.quizAttempt.count({ where: { completedAt: { not: null } } }),
        ]);

        // Get support tickets stats
        const [totalTickets, openTickets, resolvedTickets] = await Promise.all([
            prisma.supportTicket.count(),
            prisma.supportTicket.count({ 
                where: { 
                    status: { in: ['OPEN', 'IN_PROGRESS'] }
                } 
            }),
            prisma.supportTicket.count({ 
                where: { 
                    status: 'RESOLVED',
                    resolvedAt: { gte: monthStart, lte: monthEnd }
                } 
            }),
        ]);

        // Get events and attendance stats
        const [totalEvents, upcomingEvents, totalAttendance] = await Promise.all([
            prisma.eventPoint.count(),
            prisma.eventPoint.count({ 
                where: { 
                    eventDate: { gte: currentDate }
                } 
            }),
            prisma.attendance.count({ where: { status: 'present' } }),
        ]);

        // Get tasks stats
        const [totalTasks, pendingTasks, approvedSubmissions] = await Promise.all([
            prisma.task.count(),
            prisma.task.count({ 
                where: { 
                    dueDate: { gte: currentDate }
                } 
            }),
            prisma.taskSubmission.count({ 
                where: { 
                    status: 'approved',
                    evaluatedAt: { gte: monthStart, lte: monthEnd }
                } 
            }),
        ]);

        // Calculate total points distributed
        const [attendancePoints, taskPoints, eventPoints, quizPoints] = await Promise.all([
            prisma.attendance.aggregate({
                _sum: { points: true },
                where: { status: 'present' }
            }),
            prisma.taskSubmission.aggregate({
                _sum: { pointsAwarded: true },
                where: { status: 'approved' }
            }),
            prisma.eventParticipation.aggregate({
                _sum: { pointsAwarded: true },
                where: { status: 'approved' }
            }),
            prisma.quizAttempt.aggregate({
                _sum: { pointsEarned: true },
                where: { completedAt: { not: null } }
            }),
        ]);

        const totalPointsDistributed = 
            (attendancePoints._sum.points || 0) +
            (taskPoints._sum.pointsAwarded || 0) +
            (eventPoints._sum.pointsAwarded || 0) +
            (quizPoints._sum.pointsEarned || 0);

        // Get recent activities
        const recentUsers = await prisma.user.findMany({
            where: { role: { not: "admin" } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                name: true,
                email: true,
                createdAt: true,
                emailVerified: true,
            }
        });

        const recentTickets = await prisma.supportTicket.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                ticketNumber: true,
                subject: true,
                status: true,
                priority: true,
                createdAt: true,
                name: true,
            }
        });

        return {
            // User stats
            totalUsers,
            verifiedUsers,
            bannedUsers,
            newUsersThisMonth,
            
            // Announcements
            totalAnnouncements,
            activeAnnouncements,
            
            // Quizzes
            totalQuizzes,
            activeQuizzes,
            totalQuizAttempts,
            
            // Support
            totalTickets,
            openTickets,
            resolvedTickets,
            
            // Events & Attendance
            totalEvents,
            upcomingEvents,
            totalAttendance,
            
            // Tasks
            totalTasks,
            pendingTasks,
            approvedSubmissions,
            
            // Points
            totalPointsDistributed,
            
            // Recent activities
            recentUsers,
            recentTickets,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard stats');
    }
}