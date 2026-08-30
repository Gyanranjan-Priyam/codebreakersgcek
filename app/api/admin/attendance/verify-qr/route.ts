import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { emitSocketEvent, emitSocketEventToRooms } from "@/lib/socket-server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { token, sessionId } = await req.json();

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: "Token and session ID are required" },
        { status: 400 }
      );
    }

    // Find the QR code record
    const qrRecord = await prisma.attendanceQR.findUnique({
      where: { qrToken: token },
      include: {
        session: true,
      },
    });

    if (!qrRecord) {
      return NextResponse.json(
        { error: "Invalid QR code" },
        { status: 404 }
      );
    }

    // Verify session ID matches
    if (qrRecord.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "QR code does not match the session" },
        { status: 400 }
      );
    }

    // Check if QR code is still active
    if (!qrRecord.isActive) {
      return NextResponse.json(
        { error: "This QR code has been deactivated" },
        { status: 400 }
      );
    }

    // Check if QR code has expired
    if (new Date() > qrRecord.expiresAt) {
      // Deactivate expired QR code
      await prisma.attendanceQR.update({
        where: { id: qrRecord.id },
        data: { isActive: false },
      });

      return NextResponse.json(
        { error: "QR code has expired. Please ask admin to generate a new one." },
        { status: 400 }
      );
    }

    // Check if user already has attendance marked for this session
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        sessionId: sessionId,
        userId: session.user.id,
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { 
          error: "Attendance already marked for this session",
          attendance: existingAttendance,
        },
        { status: 400 }
      );
    }

    // Mark attendance using try-catch to handle race conditions
    let attendance;
    try {
      attendance = await prisma.attendance.create({
        data: {
          sessionId,
          userId: session.user.id,
          status: "present",
          points: 10, // Default points for attendance
          markedBy: "qr-scan",
          method: "qr-scan",
        },
      });
    } catch (error: any) {
      // Handle race condition where attendance was created between check and create
      if (error.code === 'P2002') {
        return NextResponse.json(
          { 
            error: "Attendance already marked for this session",
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Increment scan count
    await prisma.attendanceQR.update({
      where: { id: qrRecord.id },
      data: {
        scanCount: {
          increment: 1,
        },
      },
    });

    // Realtime broadcast via Socket.IO
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, cbUserId: true },
      });

      const realtimePayload = {
        type: "attendance-marked",
        sessionId: qrRecord.sessionId,
        sessionTitle: qrRecord.session.title,
        sessionNumber: qrRecord.session.sessionNumber,
        userId: session.user.id,
        userName: user?.name || session.user.name,
        cbUserId: user?.cbUserId,
        points: attendance.points,
        status: "present",
        timestamp: new Date().toISOString(),
        message: `Your attendance for "${qrRecord.session.title}" (Session #${qrRecord.session.sessionNumber}) has been marked Present (+${attendance.points} points)!`,
      };

      const userRooms = Array.from(
        new Set([
          `user-${session.user.id}`,
          `user:${session.user.id}`,
          ...(user?.cbUserId ? [`user-${user.cbUserId}`, `user:${user.cbUserId}`] : []),
        ])
      );
      await emitSocketEventToRooms(userRooms, "attendance-marked", realtimePayload);
      await emitSocketEvent(`attendance-session-${qrRecord.sessionId}`, "attendance-updated", realtimePayload);
      await emitSocketEvent("leaderboard", "leaderboard-updated", realtimePayload);
    } catch (broadcastErr) {
      console.warn("Could not broadcast verify-qr socket event:", broadcastErr);
    }

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully!",
      attendance,
      sessionTitle: qrRecord.session.title,
      points: attendance.points,
    });
  } catch (error) {
    console.error("Error verifying QR code:", error);
    return NextResponse.json(
      { error: "Failed to verify QR code" },
      { status: 500 }
    );
  }
}
