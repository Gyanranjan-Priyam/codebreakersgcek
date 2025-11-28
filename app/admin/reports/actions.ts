"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export interface MemberReportData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  mobileNumber: string | null;
  registration: string | null;
  branch: string | null;
  githubUsername: string | null;
  totalPoints: number;
  rank: number;
  emailVerified: boolean;
  createdAt: Date;
}

export async function getMembersReportData() {
  await requireAdmin();
  
  try {
    // Get all members
    const members = await prisma.user.findMany({
      where: {
        profileComplete: true,
        role: { not: "admin" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        mobileNumber: true,
        registration: true,
        branch: true,
        githubUsername: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate points for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const [attendancePoints, taskPoints, eventPoints, quizPoints] = await Promise.all([
          prisma.attendance.aggregate({
            where: { userId: member.id, status: 'present' },
            _sum: { points: true },
          }),
          prisma.taskSubmission.aggregate({
            where: { userId: member.id, status: 'approved' },
            _sum: { pointsAwarded: true },
          }),
          prisma.eventParticipation.aggregate({
            where: { userId: member.id, status: 'approved' },
            _sum: { pointsAwarded: true },
          }),
          prisma.quizAttempt.aggregate({
            where: { userId: member.id, completedAt: { not: null } },
            _sum: { pointsEarned: true },
          }),
        ]);

        const totalPoints =
          (attendancePoints._sum.points || 0) +
          (taskPoints._sum.pointsAwarded || 0) +
          (eventPoints._sum.pointsAwarded || 0) +
          (quizPoints._sum.pointsEarned || 0);

        return {
          ...member,
          totalPoints,
          rank: 0, // Will be calculated after sorting
        };
      })
    );

    // Sort by points and assign ranks
    const sortedMembers = membersWithStats.sort((a, b) => b.totalPoints - a.totalPoints);
    const membersWithRanks = sortedMembers.map((member, index) => ({
      ...member,
      rank: index + 1,
    }));

    return {
      status: "success" as const,
      data: membersWithRanks,
    };
  } catch (error) {
    console.error("Error fetching members report data:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch members report data",
    };
  }
}
