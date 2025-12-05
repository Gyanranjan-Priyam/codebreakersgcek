"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProjectReviews() {
  try {
    const reviews = await prisma.projectReview.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            githubUsername: true,
            whatsappNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      status: "success" as const,
      data: reviews,
    };
  } catch (error) {
    console.error("Error fetching project reviews:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch project reviews",
      data: [],
    };
  }
}

export async function updateProjectReviewStatus({
  reviewId,
  status,
  adminResponse,
}: {
  reviewId: string;
  status: "approved" | "rejected";
  adminResponse?: string;
}) {
  try {
    await prisma.projectReview.update({
      where: { id: reviewId },
      data: {
        status,
        adminResponse: adminResponse || null,
      },
    });

    revalidatePath("/admin/projects/submission-projects");
    
    return {
      success: true,
      message: `Project ${status} successfully`,
    };
  } catch (error) {
    console.error("Error updating project review status:", error);
    return {
      success: false,
      message: "Failed to update project status",
    };
  }
}

export async function approveForCollaboration({
  reviewId,
  adminResponse,
}: {
  reviewId: string;
  adminResponse?: string;
}) {
  try {
    // Update the review status
    await prisma.projectReview.update({
      where: { id: reviewId },
      data: {
        status: "approved",
        adminResponse: adminResponse || "Approved for collaboration",
      },
    });

    revalidatePath("/admin/projects/submission-projects");
    revalidatePath("/dashboard/projects/collaborative");
    
    return {
      success: true,
      message: "Project approved for collaboration",
    };
  } catch (error) {
    console.error("Error approving for collaboration:", error);
    return {
      success: false,
      message: "Failed to approve project",
    };
  }
}

export async function publishProjectFromReview({
  reviewId,
  title,
  description,
  techStack,
  projectUrl,
  thumbnailKey,
  githubRepoId,
}: {
  reviewId: string;
  title: string;
  description: string;
  techStack: string[];
  projectUrl: string | null;
  thumbnailKey: string;
  githubRepoId: number;
}) {
  try {
    const review = await prisma.projectReview.findUnique({
      where: { id: reviewId },
      include: { user: true },
    });

    if (!review) {
      return {
        success: false,
        message: "Review not found",
      };
    }

    // Check if already published
    const existing = await prisma.publishedProject.findUnique({
      where: { githubRepoId },
    });

    if (existing) {
      return {
        success: false,
        message: "This project is already published",
      };
    }

    // Create published project
    await prisma.publishedProject.create({
      data: {
        githubRepoId,
        title,
        description,
        techStack,
        projectUrl,
        thumbnailKey,
        publishedById: review.userId, // Use the user who submitted
      },
    });

    // Update review status
    await prisma.projectReview.update({
      where: { id: reviewId },
      data: {
        status: "approved",
        adminResponse: "Published to website",
      },
    });

    revalidatePath("/admin/projects/submission-projects");
    revalidatePath("/admin/projects/all-projects");
    revalidatePath("/projects");

    return {
      success: true,
      message: "Project published to website successfully",
    };
  } catch (error) {
    console.error("Error publishing project:", error);
    return {
      success: false,
      message: "Failed to publish project",
    };
  }
}
