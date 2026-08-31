"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSystemAdminRole } from "@/lib/member-roles";

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
        image: true,
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
        githubUsername: true,
        profileComplete: true,
        socialLinks: true,
        customLinks: true,
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

export async function updateAdminSocialAndCustomLinks(data: {
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    leetcode?: string;
    codeforces?: string;
    portfolio?: string;
  };
  customLinks: Array<{ id: string; title: string; url: string }>;
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        socialLinks: data.socialLinks,
        customLinks: data.customLinks,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/members");
    revalidatePath("/member");

    return {
      status: "success" as const,
      message: "Social and custom links updated successfully",
    };
  } catch (error) {
    console.error("Error updating admin social links:", error);
    return {
      status: "error" as const,
      message: "Failed to update social links",
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

    // Update user profile (keep existing email if email is changing until verified)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: isEmailChanging ? session.user.email : validatedData.email,
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

    // Revalidate all paths where admin data is displayed
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/settings");

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
        data: updatedUser,
      };
    }

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

    // Revalidate all paths where admin image is displayed
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/settings");
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

    // Revalidate all paths where admin image is displayed
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/settings");
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

    if (!isSystemAdminRole(user?.role)) {
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

export async function getGitHubOrgSetting() {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'github_organization' },
    });

    return {
      status: 'success' as const,
      data: setting?.value || '',
    };
  } catch (error) {
    console.error('Error fetching GitHub org setting:', error);
    return {
      status: 'error' as const,
      message: 'Failed to fetch GitHub organization setting',
    };
  }
}

export async function updateGitHubOrgSetting(organizationName: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !isSystemAdminRole(session.user.role)) {
      return {
        status: 'error' as const,
        message: 'Unauthorized: Admin access required',
      };
    }

    await prisma.systemSettings.upsert({
      where: { key: 'github_organization' },
      update: {
        value: organizationName,
        updatedAt: new Date(),
      },
      create: {
        key: 'github_organization',
        value: organizationName,
        description: 'GitHub organization name for fetching repositories',
      },
    });

    revalidatePath('/admin/settings');
    revalidatePath('/admin/projects/all-projects');

    return {
      status: 'success' as const,
      message: 'GitHub organization updated successfully',
    };
  } catch (error) {
    console.error('Error updating GitHub org setting:', error);
    return {
      status: 'error' as const,
      message: 'Failed to update GitHub organization setting',
    };
  }
}

export async function getGoogleDriveStatusAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { GoogleDriveService } = await import("@/lib/google-drive-service");
    const status = await GoogleDriveService.getConnectionStatus(session?.user?.id);

    return {
      status: 'success' as const,
      data: status,
    };
  } catch (error) {
    console.error('Error getting Google Drive status:', error);
    return {
      status: 'error' as const,
      message: 'Failed to get Google Drive status',
      data: { isConnected: false },
    };
  }
}