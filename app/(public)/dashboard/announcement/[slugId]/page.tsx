import { notFound } from "next/navigation";
import { AnnouncementClient } from "./_components/announcement-client";
import { prisma } from "@/lib/db";
import { type JSONContent } from "@tiptap/react";

interface AnnouncementData {
  id: string;
  slugId: string;
  title: string;
  description: JSONContent | string | null | undefined;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  attachmentKeys: string[];
  imageKeys: string[];
  createdBy: string;
}

// Fetch announcement data directly from database
async function getAnnouncement(slugId: string): Promise<AnnouncementData | null> {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { slugId },
    });

    if (!announcement) {
      return null;
    }

    return {
      id: announcement.id,
      slugId: announcement.slugId,
      title: announcement.title,
      description: announcement.description as JSONContent | string,
      category: announcement.category,
      priority: announcement.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
      attachmentKeys: announcement.attachmentKeys || [],
      imageKeys: announcement.imageKeys || [],
      createdBy: announcement.createdBy,
    };
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }
}

export default async function AnnouncementPage({ params }: { params: Promise<{ slugId: string }> }) {
  const { slugId } = await params;
  const announcement = await getAnnouncement(slugId);

  if (!announcement) {
    notFound();
  }

  return <AnnouncementClient announcement={announcement} />;
}
