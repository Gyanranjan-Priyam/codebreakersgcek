import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const attendanceSessions = await prisma.attendanceSession.findMany({
      orderBy: {
        sessionNumber: "desc",
      },
      include: {
        _count: {
          select: {
            attendances: true,
            qrCodes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessions: attendanceSessions,
    });
  } catch (error) {
    console.error("Error fetching attendance sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { sessionNumber, title, date, day } = await req.json();

    if (!sessionNumber || !title || !date || !day) {
      return NextResponse.json(
        { error: "Session number, title, date, and day are required" },
        { status: 400 }
      );
    }

    // Check if session number already exists
    const existingSession = await prisma.attendanceSession.findUnique({
      where: { sessionNumber: parseInt(sessionNumber) },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "Session number already exists" },
        { status: 400 }
      );
    }

    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        sessionNumber: parseInt(sessionNumber),
        title,
        date: new Date(date),
        day,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance session created successfully",
      session: attendanceSession,
    });
  } catch (error) {
    console.error("Error creating attendance session:", error);
    return NextResponse.json(
      { error: "Failed to create attendance session" },
      { status: 500 }
    );
  }
}
