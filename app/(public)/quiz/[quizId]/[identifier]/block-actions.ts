"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/app/data/admin/get-current-user";
import { revalidatePath } from "next/cache";

interface BlockUserFromQuizParams {
  quizId: string; // The quiz database ID
  quizIdentifier: string; // The quiz public ID (quizId field)
  reason: string;
  violationType: string;
  violationCount: number;
}

export async function blockUserFromQuizAction(params: BlockUserFromQuizParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        status: "error" as const,
        message: "User not authenticated",
      };
    }

    // Check if already blocked for this quiz
    const existingBlock = await prisma.quizBlock.findUnique({
      where: {
        quizId_userId: {
          quizId: params.quizId,
          userId: user.id,
        },
      },
    });

    if (existingBlock) {
      return {
        status: "error" as const,
        message: "User is already blocked from this quiz",
      };
    }

    // Create quiz block record
    await prisma.quizBlock.create({
      data: {
        quizId: params.quizId,
        userId: user.id,
        reason: params.reason,
        violationType: params.violationType,
        violationCount: params.violationCount,
      },
    });

    // Also mark user as globally banned
    await prisma.user.update({
      where: { id: user.id },
      data: {
        banned: true,
        banReason: `Blocked from quiz "${params.quizIdentifier}" - ${params.reason}`,
        banExpires: null, // Permanent ban unless admin unbans
      },
    });

    // Revalidate relevant paths
    revalidatePath("/admin/quizzes/blocked-members");
    revalidatePath("/dashboard/activities/quizzes");
    revalidatePath(`/quiz/${params.quizIdentifier}`);

    return {
      status: "success" as const,
      message: "User has been blocked from this quiz",
    };
  } catch (error) {
    console.error("Error blocking user from quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to block user from quiz",
    };
  }
}

export async function checkQuizBlockStatus(quizDbId: string, userId: string) {
  try {
    const block = await prisma.quizBlock.findUnique({
      where: {
        quizId_userId: {
          quizId: quizDbId,
          userId: userId,
        },
      },
    });

    return {
      status: "success" as const,
      isBlocked: !!block,
      blockDetails: block,
    };
  } catch (error) {
    console.error("Error checking quiz block status:", error);
    return {
      status: "error" as const,
      message: "Failed to check block status",
      isBlocked: false,
    };
  }
}
