import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import MemberPublicProfile from "./_components/member-public-profile";

interface PageProps {
  params: Promise<{ cbUserId: string }>;
}

async function getMemberByCbUserId(cbUserId: string) {
  // Decode the URL parameter
  const decodedId = decodeURIComponent(cbUserId);

  // Try exact match on cbUserId first
  let member = await prisma.user.findFirst({
    where: {
      cbUserId: { equals: decodedId, mode: "insensitive" },
    },
    select: {
      id: true,
      cbUserId: true,
      name: true,
      email: true,
      username: true,
      firstName: true,
      middleName: true,
      lastName: true,
      profileImageKey: true,
      registration: true,
      rollNumber: true,
      branch: true,
      admissionYear: true,
      mobileNumber: true,
      whatsappNumber: true,
      collegeName: true,
      collegeAddress: true,
      state: true,
      district: true,
      githubUsername: true,
      specializedDomain: true,
      socialLinks: true,
      customLinks: true,
      profileComplete: true,
      batch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      createdAt: true,
      role: true,
      banned: true,
    },
  });

  if (!member) {
    // Fallback: try matching by username or id
    member = await prisma.user.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { username: { equals: decodedId, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        cbUserId: true,
        name: true,
        email: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        profileImageKey: true,
        registration: true,
        rollNumber: true,
        branch: true,
        admissionYear: true,
        mobileNumber: true,
        whatsappNumber: true,
        collegeName: true,
        collegeAddress: true,
        state: true,
        district: true,
        githubUsername: true,
        specializedDomain: true,
        socialLinks: true,
        customLinks: true,
        profileComplete: true,
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        role: true,
        banned: true,
      },
    });
  }

  return member;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cbUserId } = await params;
  const member = await getMemberByCbUserId(cbUserId);

  if (!member) {
    return {
      title: "Member Not Found",
    };
  }

  return {
    title: `${member.name} | CodeBreakers GCEK`,
    description: `Public profile of ${member.name} - ${member.branch || "Member"} at CodeBreakers GCEK`,
  };
}

export default async function MemberPublicProfilePage({ params }: PageProps) {
  const { cbUserId } = await params;
  const member = await getMemberByCbUserId(cbUserId);

  if (!member || member.banned) {
    notFound();
  }

  return <MemberPublicProfile member={member} />;
}
