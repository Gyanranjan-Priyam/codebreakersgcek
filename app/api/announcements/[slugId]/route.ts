import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    const { slugId } = await params;

    if (!slugId) {
      return NextResponse.json({
        success: false,
        message: "Announcement ID is required"
      }, { status: 400 });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { slugId }
    });

    if (!announcement) {
      return NextResponse.json({
        success: false,
        message: "Announcement not found"
      }, { status: 404 });
    }

    // Transform data for response
    const formattedAnnouncement = {
      id: announcement.id,
      slugId: announcement.slugId,
      title: announcement.title,
      description: announcement.description,
      category: announcement.category,
      priority: announcement.priority,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      attachmentKeys: announcement.attachmentKeys,
      imageKeys: announcement.imageKeys,

      createdBy: announcement.createdBy
    };

    return NextResponse.json({
      success: true,
      data: formattedAnnouncement
    });

  } catch (error) {
    console.error("Error fetching announcement:", error);
    
    return NextResponse.json({
      success: false,
      message: "Failed to fetch announcement"
    }, { status: 500 });
  }
}