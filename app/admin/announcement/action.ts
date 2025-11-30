"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { announcementSchema, AnnouncementSchemaType } from "@/lib/zodSchema";
import { headers } from "next/headers";
import { sendAnnouncementNotification } from "@/lib/mailer";
import { getFileFromS3 } from "@/lib/s3Client";

// Helper function to generate announcement slugId
function generateAnnouncementSlugId(category: string): string {
  // Generate random number (4 digits)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  // Format category (remove underscores, take first 3 chars)
  const categoryCode = category.replace(/_/g, '').substring(0, 3).toUpperCase();
  
  return `CBGCEK-ANC-${categoryCode}-GEN-${randomNum}`;
}

interface CreateAnnouncementResult {
  success: boolean;
  message: string;
  announcement?: any;
}

// Function to get all user emails for notifications
export async function getAllUserEmails() {
  try {
    const users = await prisma.user.findMany({
      where: {
        emailVerified: true,
        banned: {
          not: true
        }
      },
      select: {
        email: true,
      },
    });

    return users.map(user => user.email);
  } catch (error) {
    console.error("Error fetching user emails:", error);
    // Return empty array as fallback when database is unavailable
    return [];
  }
}

export async function createAnnouncement(data: AnnouncementSchemaType): Promise<CreateAnnouncementResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return {
        success: false,
        message: "Admin privileges required",
      };
    }

    // Validate the input data
    const validatedData = announcementSchema.parse(data);
    
    // Generate unique slugId
    const slugId = generateAnnouncementSlugId(validatedData.category);

    // Create the announcement
    const announcement = await prisma.announcement.create({
      data: {
        slugId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        attachmentKeys: validatedData.attachmentKeys,
        imageKeys: validatedData.imageKeys,
        audience: validatedData.audience,
        sendNotifications: validatedData.sendNotifications,
        isPinned: validatedData.isPinned,
        showInHomeBanner: validatedData.showInHomeBanner,
        publishDate: validatedData.publishDate,
        expiryDate: validatedData.expiryDate,
        isRecurring: validatedData.isRecurring,
        recurrenceType: validatedData.recurrenceType,
        recurrenceInterval: validatedData.recurrenceInterval,
        createdBy: session.user.id,
        lastRecurrenceRun: validatedData.isRecurring ? validatedData.publishDate : null,
      },
    });

    // Send email notifications if enabled
    if (validatedData.sendNotifications) {
      try {
        // Get all user emails
        const userEmails = await getAllUserEmails();
        
        if (userEmails.length > 0) {
          // Prepare file attachments
          const emailAttachments: Array<{
            filename: string;
            content: Buffer;
            contentType?: string;
          }> = [];

          // Download and prepare attachment files
          if (validatedData.attachmentKeys && validatedData.attachmentKeys.length > 0) {
            for (const fileKey of validatedData.attachmentKeys) {
              try {
                const fileBuffer = await getFileFromS3(fileKey, 'files');
                const filename = fileKey.split('/').pop() || fileKey;
                emailAttachments.push({
                  filename,
                  content: fileBuffer,
                  contentType: 'application/octet-stream',
                });
              } catch (fileError) {
                console.error(`Error downloading attachment ${fileKey}:`, fileError);
                // Continue with other files if one fails
              }
            }
          }

          // Download and prepare image files
          if (validatedData.imageKeys && validatedData.imageKeys.length > 0) {
            for (const imageKey of validatedData.imageKeys) {
              try {
                const imageBuffer = await getFileFromS3(imageKey, 'images');
                const filename = imageKey.split('/').pop() || imageKey;
                const extension = filename.split('.').pop()?.toLowerCase();
                const contentType = extension === 'png' ? 'image/png' : 
                                  extension === 'gif' ? 'image/gif' :
                                  extension === 'webp' ? 'image/webp' :
                                  'image/jpeg';
                emailAttachments.push({
                  filename,
                  content: imageBuffer,
                  contentType,
                });
              } catch (fileError) {
                console.error(`Error downloading image ${imageKey}:`, fileError);
                // Continue with other files if one fails
              }
            }
          }

          // Send the notification email
          await sendAnnouncementNotification({
            recipients: userEmails,
            title: validatedData.title,
            description: (() => {
              try {
                // Try to parse as JSON (TipTap content)
                return JSON.parse(validatedData.description);
              } catch {
                // If it's not valid JSON, use as plain string
                return validatedData.description;
              }
            })(),
            category: validatedData.category,
            priority: validatedData.priority,
            publishDate: validatedData.publishDate.toLocaleDateString(),
            expiryDate: validatedData.expiryDate?.toLocaleDateString(),
            attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
          });

          console.log(`Announcement notification sent to ${userEmails.length} users`);
        }
      } catch (emailError) {
        console.error('Error sending announcement notifications:', emailError);
        // Don't fail the announcement creation if email fails
      }
    }

    // Revalidate relevant pages
    revalidatePath("/admin/announcement");
    revalidatePath("/");
    revalidatePath("/(public)/dashboard");

    return {
      success: true,
      message: "Announcement created successfully",
      announcement,
    };

  } catch (error) {
    console.error("Error creating announcement:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    return {
      success: false,
      message: "Failed to create announcement",
    };
  }
}

export async function updateAnnouncement(id: string, data: AnnouncementSchemaType): Promise<CreateAnnouncementResult> {
  try {
    // Validate parameters
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        message: "Valid announcement ID is required",
      };
    }

    if (!data) {
      return {
        success: false,
        message: "Announcement data is required",
      };
    }

    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return {
        success: false,
        message: "Admin privileges required",
      };
    }

    // Validate the input data
    const validatedData = announcementSchema.parse(data);

    // Update the announcement
    const announcement = await prisma.announcement.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        attachmentKeys: validatedData.attachmentKeys,
        imageKeys: validatedData.imageKeys,
        audience: validatedData.audience,
        sendNotifications: validatedData.sendNotifications,
        isPinned: validatedData.isPinned,
        showInHomeBanner: validatedData.showInHomeBanner,
        publishDate: validatedData.publishDate,
        expiryDate: validatedData.expiryDate,
        isRecurring: validatedData.isRecurring,
        recurrenceType: validatedData.recurrenceType,
        recurrenceInterval: validatedData.recurrenceInterval,
      },
    });

    // Send email notifications if enabled
    if (validatedData.sendNotifications) {
      try {
        // Get all verified user emails
        const userEmails = await getAllUserEmails();
        
        if (userEmails.length > 0) {
          // Prepare email attachments
          const emailAttachments: Array<{
            filename: string;
            content: Buffer;
            contentType?: string;
          }> = [];

          // Download and attach files from S3
          if (validatedData.attachmentKeys.length > 0) {
            for (const attachmentKey of validatedData.attachmentKeys) {
              try {
                const fileBuffer = await getFileFromS3(attachmentKey);
                const filename = attachmentKey.split('/').pop() || attachmentKey;
                
                emailAttachments.push({
                  filename: filename,
                  content: fileBuffer,
                  contentType: 'application/octet-stream',
                });
              } catch (fileError) {
                console.error(`Error downloading attachment ${attachmentKey}:`, fileError);
                // Continue with other files if one fails
              }
            }
          }

          // Download and attach images from S3
          if (validatedData.imageKeys.length > 0) {
            for (const imageKey of validatedData.imageKeys) {
              try {
                const imageBuffer = await getFileFromS3(imageKey);
                const filename = imageKey.split('/').pop() || imageKey;
                const contentType = filename.endsWith('.png') ? 'image/png' :
                                  filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                                  filename.endsWith('.gif') ? 'image/gif' :
                                  filename.endsWith('.webp') ? 'image/webp' :
                                  'image/jpeg';
                
                emailAttachments.push({
                  filename: filename,
                  content: imageBuffer,
                  contentType: contentType,
                });
              } catch (fileError) {
                console.error(`Error downloading image ${imageKey}:`, fileError);
                // Continue with other files if one fails
              }
            }
          }

          // Send the notification email
          await sendAnnouncementNotification({
            recipients: userEmails,
            title: `🔄 UPDATED: ${validatedData.title}`,
            description: (() => {
              try {
                // Try to parse as JSON (TipTap content)
                return JSON.parse(validatedData.description);
              } catch {
                // If it's not valid JSON, use as plain string
                return validatedData.description;
              }
            })(),
            category: validatedData.category,
            priority: validatedData.priority,
            publishDate: validatedData.publishDate.toLocaleDateString(),
            expiryDate: validatedData.expiryDate?.toLocaleDateString(),
            attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
            isUpdate: true,
          });

          console.log(`Updated announcement notification sent to ${userEmails.length} users`);
        }
      } catch (emailError) {
        console.error('Error sending updated announcement notifications:', emailError);
        // Don't fail the announcement update if email fails
      }
    }

    // Revalidate relevant pages
    revalidatePath("/admin/announcement");
    revalidatePath("/");
    revalidatePath("/(public)/dashboard");

    return {
      success: true,
      message: "Announcement updated successfully",
      announcement,
    };

  } catch (error) {
    console.error("Error updating announcement:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    return {
      success: false,
      message: "Failed to update announcement",
    };
  }
}

export async function deleteAnnouncement(id: string): Promise<CreateAnnouncementResult> {
  try {
    // Validate id parameter
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        message: "Valid announcement ID is required",
      };
    }

    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return {
        success: false,
        message: "Admin privileges required",
      };
    }

    // Permanently delete the announcement (as requested)
    await prisma.announcement.delete({
      where: { id }
    });

    // Revalidate relevant pages
    revalidatePath("/admin/announcement");
    revalidatePath("/");
    revalidatePath("/(public)/dashboard");

    return {
      success: true,
      message: "Announcement deleted successfully",
    };

  } catch (error) {
    console.error("Error deleting announcement:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    return {
      success: false,
      message: "Failed to delete announcement",
    };
  }
}

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        slugId: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        audience: true,
        publishDate: true,
        expiryDate: true,
        isPinned: true,
        showInHomeBanner: true,
        isRecurring: true,
        attachmentKeys: true,
        imageKeys: true,
        createdAt: true,
      },
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    // Return empty array as fallback when database is unavailable
    return [];
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    return announcement;
  } catch (error) {
    console.error("Error fetching announcement:", error);
    throw error;
  }
}

export async function getAnnouncementBySlugId(slugId: string) {
  try {
    // Validate slugId parameter
    if (!slugId || typeof slugId !== 'string') {
      throw new Error("Valid slugId is required");
    }

    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      throw new Error("Authentication required");
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const announcement = await prisma.announcement.findUnique({
      where: {
        slugId,
        isDeleted: false,
      },
    });

    return announcement;
  } catch (error) {
    console.error("Error fetching announcement:", error);
    
    // Check if it's a database connectivity error
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      throw new Error("Database is currently unavailable. Please try again later.");
    }
    
    throw error;
  }
}

export async function getPublicAnnouncements() {
  try {
    const now = new Date();
    
    const announcements = await prisma.announcement.findMany({
      where: {
        isDeleted: false,
        publishDate: {
          lte: now,
        },
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: now } },
        ],
        audience: {
          in: ["PUBLIC"],
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching public announcements:", error);
    throw error;
  }
}

export async function getBannerAnnouncements() {
  try {
    const now = new Date();
    
    const announcements = await prisma.announcement.findMany({
      where: {
        isDeleted: false,
        publishDate: {
          lte: now,
        },
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: now } },
        ],
        showInHomeBanner: true,
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: 3, // Limit to 3 banner announcements
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching banner announcements:", error);
    throw error;
  }
}

export async function getEventsForAnnouncements() {
  try {
    const events = await prisma.eventPoint.findMany({
      orderBy: {
        eventDate: 'desc',
      },
      select: {
        id: true,
        title: true,
        eventDate: true,
      }
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.eventDate,
      slugId: event.id, // Using id as slugId since EventPoint doesn't have a separate slug
    }));
  } catch (error) {
    console.error("Error fetching events for announcements:", error);
    return [];
  }
}

