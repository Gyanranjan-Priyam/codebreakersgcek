"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export interface IncompleteProfileData {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  emailVerified: boolean;
}

export async function getAllIncompleteProfiles() {
  await requireAdmin();
  
  try {
    const profiles = await prisma.user.findMany({
      where: {
        profileComplete: false,
        role: { not: "admin" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: "success" as const,
      data: profiles,
    };
  } catch (error) {
    console.error("Error fetching incomplete profiles:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch incomplete profiles",
    };
  }
}

export async function deleteIncompleteProfile(id: string) {
  await requireAdmin();
  
  try {
    await prisma.user.delete({
      where: { id },
    });

    return {
      status: "success" as const,
      message: "Incomplete profile deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting incomplete profile:", error);
    return {
      status: "error" as const,
      message: "Failed to delete incomplete profile",
    };
  }
}

export async function getIncompleteProfilesStats() {
  await requireAdmin();
  
  try {
    const [totalIncomplete, recentIncomplete, oldIncomplete] = await Promise.all([
      prisma.user.count({ 
        where: { 
          profileComplete: false,
          role: { not: "admin" },
        } 
      }),
      prisma.user.count({ 
        where: { 
          profileComplete: false,
          role: { not: "admin" },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          }
        } 
      }),
      prisma.user.count({ 
        where: { 
          profileComplete: false,
          role: { not: "admin" },
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Older than 30 days
          }
        } 
      }),
    ]);

    return {
      status: "success" as const,
      data: {
        totalIncomplete,
        recentIncomplete,
        oldIncomplete,
      },
    };
  } catch (error) {
    console.error("Error fetching incomplete profiles stats:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch statistics",
    };
  }
}
