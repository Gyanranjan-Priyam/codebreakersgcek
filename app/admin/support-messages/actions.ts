"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mailer";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { getFileFromS3 } from "@/lib/s3Client";

// Validation schemas
const supportResponseSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  message: z.string().min(10, "Response must be at least 10 characters").max(2000, "Response must be less than 2000 characters"),
  isInternal: z.boolean().default(false),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    fileKey: z.string(),
  })).optional().default([]),
});

const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export async function getAllSupportTickets(page: number = 1, limit: number = 20, status?: string) {
  try {
    // Ensure only admin can access - this will redirect if not admin
    const session = await requireAdmin();

    const whereCondition = status && status !== "all" ? { status: status as any } : {};
    const skip = (page - 1) * limit;

    const [tickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileSize: true,
              mimeType: true,
              fileKey: true,
            }
          },
          responses: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              responses: {
                where: { isInternal: false }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      status: "success" as const,
      data: {
        tickets,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasMore: page < totalPages,
        }
      },
    };
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch support tickets",
    };
  }
}

export async function getSupportTicketDetails(ticketId: string) {
  try {
    // Ensure only admin can access
    const session = await requireAdmin();

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            mobileNumber: true,
            whatsappNumber: true,
          }
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            fileKey: true,
            createdAt: true,
          }
        },
        responses: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!ticket) {
      return {
        status: "error" as const,
        message: "Ticket not found",
      };
    }

    return {
      status: "success" as const,
      data: ticket,
    };
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch ticket details",
    };
  }
}

export async function getSupportTicketByNumber(ticketNumber: string) {
  try {
    // Ensure only admin can access
    const session = await requireAdmin();

    const ticket = await prisma.supportTicket.findUnique({
      where: { ticketNumber: ticketNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            mobileNumber: true,
            whatsappNumber: true,
          }
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            fileKey: true,
            createdAt: true,
          }
        },
        responses: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            attachments: {
              select: {
                id: true,
                fileName: true,
                fileSize: true,
                mimeType: true,
                fileKey: true,
                createdAt: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!ticket) {
      return {
        status: "error" as const,
        message: "Ticket not found",
      };
    }

    return {
      status: "success" as const,
      data: ticket,
    };
  } catch (error) {
    console.error("Error fetching ticket details by number:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch ticket details",
    };
  }
}

export async function createSupportResponse(data: z.infer<typeof supportResponseSchema>) {
  try {
    // Ensure only admin can access
    const session = await requireAdmin();

    // Validate the input data
    const validatedData = supportResponseSchema.parse(data);

    // Get ticket details for email
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: validatedData.ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!ticket) {
      return {
        status: "error" as const,
        message: "Ticket not found",
      };
    }

    // Create the response
    const response = await prisma.$transaction(async (tx) => {
      const newResponse = await tx.supportResponse.create({
        data: {
          ticketId: validatedData.ticketId,
          adminId: session.user.id,
          message: validatedData.message,
          isInternal: validatedData.isInternal,
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // Create response attachments if any
      if (validatedData.attachments && validatedData.attachments.length > 0) {
        await tx.supportResponseAttachment.createMany({
          data: validatedData.attachments.map(attachment => ({
            responseId: newResponse.id,
            fileName: attachment.fileName,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            fileKey: attachment.fileKey,
          }))
        });
      }

      // Update ticket status to IN_PROGRESS if it's OPEN
      if (ticket.status === "OPEN") {
        await tx.supportTicket.update({
          where: { id: validatedData.ticketId },
          data: { 
            status: "IN_PROGRESS",
            updatedAt: new Date(),
          }
        });
      } else {
        // Just update the timestamp
        await tx.supportTicket.update({
          where: { id: validatedData.ticketId },
          data: { updatedAt: new Date() }
        });
      }

      return newResponse;
    });

    // Send email notification to user (only for non-internal responses)
    if (!validatedData.isInternal) {
      try {
        const emailContent = `
Dear ${ticket.user.name || 'User'},

Thank you for contacting our support team. We have received your message regarding:

**Ticket #${ticket.ticketNumber}**: ${ticket.subject}

**Our Response:**
${validatedData.message}

${validatedData.attachments && validatedData.attachments.length > 0 ? 
`
**Attachments:**
We have included ${validatedData.attachments.length} file(s) with this response for your reference.
` : ''}

If you have any further questions or need additional assistance, please don't hesitate to reply to this email or contact us through your dashboard.

You can view and manage your support tickets here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contact-support

Best regards,
${session.user.name || 'Support Team'}
CodeBreakers | GCEK Support Team

---
This is an automated message from our support system. Please do not reply directly to this email.
        `;

        // Prepare email attachments by downloading files from S3
        const emailAttachments = [];
        if (validatedData.attachments && validatedData.attachments.length > 0) {
          for (const attachment of validatedData.attachments) {
            try {
              const fileBuffer = await getFileFromS3(attachment.fileKey);
              emailAttachments.push({
                filename: attachment.fileName,
                content: fileBuffer,
                contentType: attachment.mimeType,
              });
            } catch (fileError) {
              console.error(`Failed to download attachment ${attachment.fileName}:`, fileError);
              // Continue with other attachments if one fails
            }
          }
        }

        await sendEmail({
          to: ticket.user.email,
          subject: `Re: Support Ticket #${ticket.ticketNumber} - ${ticket.subject}`,
          html: emailContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the response creation if email fails
      }
    }

    revalidatePath("/admin/support-messages");
    revalidatePath(`/admin/support-messages/${validatedData.ticketId}`);

    return {
      status: "success" as const,
      message: validatedData.isInternal 
        ? "Internal note added successfully"
        : "Response sent successfully and user has been notified via email",
      data: response,
    };
  } catch (error) {
    console.error("Error creating support response:", error);
    
    if (error instanceof z.ZodError) {
      return {
        status: "error" as const,
        message: "Please check your input data and try again",
      };
    }

    return {
      status: "error" as const,
      message: "Failed to send response. Please try again",
    };
  }
}

export async function updateSupportTicketStatus(data: z.infer<typeof updateTicketStatusSchema>) {
  try {
    // Ensure only admin can access
    const session = await requireAdmin();

    const validatedData = updateTicketStatusSchema.parse(data);

    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date(),
    };

    if (validatedData.priority) {
      updateData.priority = validatedData.priority;
    }

    if (validatedData.status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: validatedData.ticketId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Send email notification for status changes
    if (validatedData.status === "RESOLVED" || validatedData.status === "CLOSED") {
      try {
        const statusText = validatedData.status === "RESOLVED" ? "resolved" : "closed";
        const emailContent = `
Dear ${ticket.user.name || 'User'},

Your support ticket has been ${statusText}.

**Ticket #${ticket.ticketNumber}**: ${ticket.subject}

${validatedData.status === "RESOLVED" 
  ? "We believe we have resolved your issue. If you're still experiencing problems, please feel free to contact us again."
  : "This ticket has been closed. If you need further assistance, please create a new support ticket."
}

You can view your support tickets here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contact-support

Thank you for using our support service!

Best regards,
CodeBreakers | GCEK Support Team
        `;

        await sendEmail({
          to: ticket.user.email,
          subject: `Support Ticket #${ticket.ticketNumber} - ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
          html: emailContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        });
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    revalidatePath("/admin/support-messages");
    revalidatePath(`/admin/support-messages/${validatedData.ticketId}`);

    return {
      status: "success" as const,
      message: `Ticket status updated to ${validatedData.status}`,
      data: ticket,
    };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    
    if (error instanceof z.ZodError) {
      return {
        status: "error" as const,
        message: "Invalid data provided",
      };
    }

    return {
      status: "error" as const,
      message: "Failed to update ticket status",
    };
  }
}

export async function getSupportStatistics() {
  try {
    // Ensure only admin can access
    const session = await requireAdmin();

    const [statusCounts, priorityCounts, recentTickets] = await Promise.all([
      prisma.supportTicket.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: { priority: true },
      }),
      prisma.supportTicket.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const totalTickets = statusCounts.reduce((sum, item) => sum + item._count.status, 0);

    return {
      status: "success" as const,
      data: {
        totalTickets,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        priorityCounts: priorityCounts.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {} as Record<string, number>),
        recentTickets,
      },
    };
  } catch (error) {
    console.error("Error fetching support statistics:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch statistics",
    };
  }
}
