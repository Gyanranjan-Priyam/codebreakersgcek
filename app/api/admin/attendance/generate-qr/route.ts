import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { randomBytes } from "crypto";
import { isSystemAdminRole } from "@/lib/member-roles";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !isSystemAdminRole(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify the attendance session exists
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { error: "Attendance session not found" },
        { status: 404 }
      );
    }

    // Deactivate any existing active QR codes for this session
    await prisma.attendanceQR.updateMany({
      where: {
        sessionId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Generate a unique token for the QR code
    const qrToken = randomBytes(32).toString("hex");

    // Set expiration time to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create the QR code record in database
    const qrRecord = await prisma.attendanceQR.create({
      data: {
        sessionId,
        qrToken,
        expiresAt,
        createdBy: session.user.id,
        isActive: true,
        scanCount: 0,
      },
    });

    // Generate QR code data URL (what will be embedded in QR)
    const qrData = JSON.stringify({
      token: qrToken,
      sessionId,
      type: "attendance",
    });

    // Generate QR code image as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 512,
      margin: 2,
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      qrToken,
      expiresAt: expiresAt.toISOString(),
      sessionId,
      sessionTitle: attendanceSession.title,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
