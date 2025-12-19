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

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get active QR codes for this session
    const activeQRCodes = await prisma.attendanceQR.findMany({
      where: {
        sessionId,
        isActive: true,
        expiresAt: {
          gte: new Date(), // Only get non-expired QR codes
        },
      },
      include: {
        session: {
          select: {
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      qrCodes: activeQRCodes,
    });
  } catch (error) {
    console.error("Error fetching active QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch active QR codes" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const { qrToken } = await req.json();

    if (!qrToken) {
      return NextResponse.json(
        { error: "QR token is required" },
        { status: 400 }
      );
    }

    // Deactivate the QR code
    const updatedQR = await prisma.attendanceQR.update({
      where: { qrToken },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "QR code deactivated successfully",
      qrCode: updatedQR,
    });
  } catch (error) {
    console.error("Error deactivating QR code:", error);
    return NextResponse.json(
      { error: "Failed to deactivate QR code" },
      { status: 500 }
    );
  }
}
