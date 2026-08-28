/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for user profile updates
const userProfileUpdateSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid mobile number"),
  whatsappNumber: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\+?[\d\s\-\(\)]+$/.test(val) && val.replace(/\D/g, '').length >= 10;
  }, "Please enter a valid WhatsApp number"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be 12 digits").max(12, "Aadhaar number must be 12 digits").regex(/^\d{12}$/, "Aadhaar number must contain only digits"),
  state: z.string().min(1, "State is required").max(50, "State name is too long"),
  district: z.string().min(1, "District is required").max(50, "District name is too long"),
  collegeName: z.string().min(1, "College name is required").max(200, "College name is too long"),
  collegeAddress: z.string().min(1, "College address is required").max(500, "College address is too long"),
  username: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  registration: z.string().optional(),
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  admissionYear: z.string().optional(),
  address: z.string().optional(),
  postOffice: z.string().optional(),
  policeStation: z.string().optional(),
  block: z.string().optional(),
  pinCode: z.string().optional(),
});

export interface UserProfileData {
  name: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  registration?: string;
  rollNumber?: string;
  branch?: string;
  admissionYear?: string;
  address?: string;
  postOffice?: string;
  policeStation?: string;
  block?: string;
  pinCode?: string;
}

export async function getCurrentUserProfileData() {
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
        image: true,
        aadhaarNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
        createdAt: true,
        updatedAt: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        address: true,
        postOffice: true,
        policeStation: true,
        block: true,
        pinCode: true,
        githubUsername: true,
        profileComplete: true,
        specializedDomain: true,
        socialLinks: true,
        customLinks: true,
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
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

export async function updateUserProfileData(data: UserProfileData) {
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
    const validation = userProfileUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error" as const,
        message: "Invalid data provided",
        errors: validation.error.format(),
      };
    }

    const validatedData = validation.data;

    const isEmailChanging = validatedData.email.toLowerCase() !== session.user.email.toLowerCase();

    // Check if email is being changed and if it's already taken by another user
    if (isEmailChanging) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email.toLowerCase(),
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

    // Update user profile (keep current email if changed until verified)
    const updatedUser = await prisma.$transaction(async (tx) => {
      return await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: validatedData.name,
          email: isEmailChanging ? session.user.email : validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          whatsappNumber: validatedData.whatsappNumber || null,
          aadhaarNumber: validatedData.aadhaarNumber,
          state: validatedData.state,
          district: validatedData.district,
          collegeName: validatedData.collegeName,
          collegeAddress: validatedData.collegeAddress,
          username: validatedData.username || null,
          firstName: validatedData.firstName || null,
          middleName: validatedData.middleName || null,
          lastName: validatedData.lastName || null,
          registration: validatedData.registration || null,
          rollNumber: validatedData.rollNumber || null,
          branch: validatedData.branch || null,
          admissionYear: validatedData.admissionYear || null,
          address: validatedData.address || null,
          postOffice: validatedData.postOffice || null,
          policeStation: validatedData.policeStation || null,
          block: validatedData.block || null,
          pinCode: validatedData.pinCode || null,
          updatedAt: new Date(),
        },
      });
    });

    // Revalidate all paths where user data is displayed
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/leaderboard");
    revalidatePath("/", "layout"); // Revalidate root layout to update sidebar

    if (isEmailChanging) {
      // Send OTP to the new email address
      const { requestEmailChangeOTP } = await import("@/lib/email-change-service");
      const otpResult = await requestEmailChangeOTP(validatedData.email);

      if (otpResult.status === "error") {
        return {
          status: "error" as const,
          message: `Profile saved, but failed to send verification code to ${validatedData.email}: ${otpResult.message}`,
        };
      }

      return {
        status: "requires_email_verification" as const,
        pendingEmail: validatedData.email.toLowerCase(),
        message: `Profile details saved. A 6-digit verification code has been sent to ${validatedData.email} to confirm the email update.`,
      };
    }

    return {
      status: "success" as const,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to update profile. Please try again.",
    };
  }
}

export async function updateUserProfileImage(profileImageKey: string) {
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

    // Revalidate all paths where user image is displayed
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/", "layout"); // Revalidate root layout to update sidebar

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

export async function removeUserProfileImage() {
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

    // Revalidate all paths where user image is displayed
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/", "layout"); // Revalidate root layout to update sidebar

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

export async function updateUserSocialAndCustomLinks(data: {
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    leetcode?: string;
    codeforces?: string;
    portfolio?: string;
  };
  customLinks?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}) {
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
      select: { id: true, cbUserId: true },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found",
      };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        socialLinks: (data.socialLinks || {}) as any,
        customLinks: (data.customLinks || []) as any,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/members");
    revalidatePath("/member");
    if (user.cbUserId) {
      revalidatePath(`/member/${user.cbUserId}`);
    }
    revalidatePath(`/member/${session.user.id}`);

    return {
      status: "success" as const,
      message: "Social and custom links updated successfully",
    };
  } catch (error) {
    console.error("Error updating user social links:", error);
    return {
      status: "error" as const,
      message: "Failed to update social links",
    };
  }
}
