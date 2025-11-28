"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\+?[\d\s\-\(\)]+$/.test(val) && val.replace(/\D/g, '').length >= 10;
  }, "Please enter a valid mobile number"),
  whatsappNumber: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\+?[\d\s\-\(\)]+$/.test(val) && val.replace(/\D/g, '').length >= 10;
  }, "Please enter a valid WhatsApp number"),
  upiId: z.string().optional().refine((val) => {
    if (!val) return true;
    // Basic UPI ID validation: should contain @ and be in format like user@bank
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(val);
  }, "Please enter a valid UPI ID (e.g., user@paytm, user@ybl)"),
  username: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  registration: z.string().optional(),
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  admissionYear: z.string().optional(),
  collegeName: z.string().optional(),
  collegeAddress: z.string().optional(),
  address: z.string().optional(),
  postOffice: z.string().optional(),
  policeStation: z.string().optional(),
  block: z.string().optional(),
  pinCode: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
});

export interface ProfileUpdateData {
  name: string;
  email: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  upiId?: string;
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  aadhaarNumber?: string;
  registration?: string;
  rollNumber?: string;
  branch?: string;
  admissionYear?: string;
  collegeName?: string;
  collegeAddress?: string;
  address?: string;
  postOffice?: string;
  policeStation?: string;
  block?: string;
  pinCode?: string;
  state?: string;
  district?: string;
}

export async function getCurrentUserProfile() {
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        profileImageKey: true,
        upiId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        aadhaarNumber: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        collegeName: true,
        collegeAddress: true,
        address: true,
        postOffice: true,
        policeStation: true,
        block: true,
        pinCode: true,
        state: true,
        district: true,
      },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found",
      };
    }

    return {
      status: "success" as const,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch profile",
    };
  }
}

export async function updateUserProfile(data: ProfileUpdateData) {
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

    // Validate input data
    const validation = profileUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error" as const,
        message: "Invalid data provided",
        errors: validation.error.format(),
      };
    }

    const validatedData = validation.data;

    // Check if email is being changed and if it's already taken by another user
    if (validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return {
          status: "error" as const,
          message: "Email address is already taken by another user",
        };
      }
    }

    // Check if username is being changed and if it's already taken by another user
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return {
          status: "error" as const,
          message: "Username is already taken by another user",
        };
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        mobileNumber: validatedData.mobileNumber || null,
        whatsappNumber: validatedData.whatsappNumber || null,
        upiId: validatedData.upiId || null,
        username: validatedData.username || null,
        firstName: validatedData.firstName || null,
        middleName: validatedData.middleName || null,
        lastName: validatedData.lastName || null,
        aadhaarNumber: validatedData.aadhaarNumber || null,
        registration: validatedData.registration || null,
        rollNumber: validatedData.rollNumber || null,
        branch: validatedData.branch || null,
        admissionYear: validatedData.admissionYear || null,
        collegeName: validatedData.collegeName || null,
        collegeAddress: validatedData.collegeAddress || null,
        address: validatedData.address || null,
        postOffice: validatedData.postOffice || null,
        policeStation: validatedData.policeStation || null,
        block: validatedData.block || null,
        pinCode: validatedData.pinCode || null,
        state: validatedData.state || null,
        district: validatedData.district || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        profileImageKey: true,
        upiId: true,
        updatedAt: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        aadhaarNumber: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        collegeName: true,
        collegeAddress: true,
        address: true,
        postOffice: true,
        policeStation: true,
        block: true,
        pinCode: true,
        state: true,
        district: true,
      },
    });

    // Revalidate the settings page to show updated data
    revalidatePath("/admin/settings");

    return {
      status: "success" as const,
      message: "Profile updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to update profile. Please try again.",
    };
  }
}

export async function updateProfileImage(profileImageKey: string) {
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

    // Update user's profile image
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImageKey: profileImageKey,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        profileImageKey: true,
        updatedAt: true,
      },
    });

    // Revalidate the settings page
    revalidatePath("/admin/settings");

    return {
      status: "success" as const,
      message: "Profile image updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return {
      status: "error" as const,
      message: "Failed to update profile image. Please try again.",
    };
  }
}

export async function removeProfileImage() {
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

    // Remove user's profile image
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImageKey: null,
        updatedAt: new Date(),
      },
    });

    // Revalidate the settings page
    revalidatePath("/admin/settings");

    return {
      status: "success" as const,
      message: "Profile image removed successfully",
    };
  } catch (error) {
    console.error("Error removing profile image:", error);
    return {
      status: "error" as const,
      message: "Failed to remove profile image. Please try again.",
    };
  }
}

export async function getRegistrationSetting() {
  try {
    // Try to find the setting first
    let setting = await prisma.systemSettings.findUnique({
      where: { key: "registration_enabled" },
    });

    // If it doesn't exist, create it with default value
    if (!setting) {
      setting = await prisma.systemSettings.create({
        data: {
          key: "registration_enabled",
          value: "true",
          description: "Controls whether user registration is enabled or disabled",
        },
      });
    }

    return {
      status: "success" as const,
      data: setting.value === "true",
    };
  } catch (error) {
    console.error("Error fetching registration setting:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch registration setting",
      data: true, // Default to enabled if error
    };
  }
}

export async function updateRegistrationSetting(enabled: boolean) {
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

    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return {
        status: "error" as const,
        message: "Admin access required",
      };
    }

    // Upsert the registration setting
    await prisma.systemSettings.upsert({
      where: { key: "registration_enabled" },
      update: {
        value: enabled.toString(),
        updatedAt: new Date(),
      },
      create: {
        key: "registration_enabled",
        value: enabled.toString(),
        description: "Controls whether user registration is enabled or disabled",
      },
    });

    // Revalidate relevant pages
    revalidatePath("/admin/settings");
    revalidatePath("/register");

    return {
      status: "success" as const,
      message: `Registration ${enabled ? "enabled" : "disabled"} successfully`,
    };
  } catch (error) {
    console.error("Error updating registration setting:", error);
    return {
      status: "error" as const,
      message: "Failed to update registration setting. Please try again.",
    };
  }
}