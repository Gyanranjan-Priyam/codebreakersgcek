import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category');

    // Build where clause
    const whereClause: any = {};
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Fetch announcements with pagination
    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: (page - 1) * limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.announcement.count({
      where: whereClause
    });

    // Transform data for the response
    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      slugId: announcement.slugId,
      title: announcement.title,
      description: announcement.description,
      category: announcement.category,
      priority: announcement.priority,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      hasAttachments: announcement.attachmentKeys && announcement.attachmentKeys.length > 0,
      hasImages: announcement.imageKeys && announcement.imageKeys.length > 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        announcements: formattedAnnouncements,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching public announcements:", error);
    
    return NextResponse.json({
      success: false,
      message: "Failed to fetch announcements",
      data: {
        announcements: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }
    }, { status: 500 });
  }
}