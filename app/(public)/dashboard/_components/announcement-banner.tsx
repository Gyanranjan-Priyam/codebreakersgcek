"use client";

import { useState } from "react";
import { X, Megaphone, Pin, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BannerAnnouncement {
  id: string;
  slugId: string;
  title: string;
  priority: string;
  isPinned: boolean;
}

interface AnnouncementBannerProps {
  announcements: BannerAnnouncement[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const visibleAnnouncements = announcements.filter(
    (ann) => !dismissedIds.includes(ann.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const getPriorityStyles = (priority: string, isPinned: boolean) => {
    if (isPinned) {
      return {
        bg: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
        text: "text-purple-900 dark:text-purple-100",
        icon: "text-purple-600 dark:text-purple-400",
        hover: "hover:bg-purple-100 dark:hover:bg-purple-900",
      };
    }

    switch (priority) {
      case "URGENT":
        return {
          bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
          text: "text-red-900 dark:text-red-100",
          icon: "text-red-600 dark:text-red-400",
          hover: "hover:bg-red-100 dark:hover:bg-red-900",
        };
      case "HIGH":
        return {
          bg: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800",
          text: "text-orange-900 dark:text-orange-100",
          icon: "text-orange-600 dark:text-orange-400",
          hover: "hover:bg-orange-100 dark:hover:bg-orange-900",
        };
      case "NORMAL":
      default:
        return {
          bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
          text: "text-blue-900 dark:text-blue-100",
          icon: "text-blue-600 dark:text-blue-400",
          hover: "hover:bg-blue-100 dark:hover:bg-blue-900",
        };
    }
  };

  const getPriorityIcon = (priority: string, isPinned: boolean) => {
    if (isPinned) return Pin;
    
    switch (priority) {
      case "URGENT":
        return AlertTriangle;
      case "HIGH":
        return Megaphone;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const styles = getPriorityStyles(announcement.priority, announcement.isPinned);
        const IconComponent = getPriorityIcon(announcement.priority, announcement.isPinned);

        return (
          <div
            key={announcement.id}
            className={cn(
              "flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors",
              styles.bg
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <IconComponent className={cn("h-5 w-5 shrink-0", styles.icon)} />
              <Link
                href={`/announcement/${announcement.slugId}`}
                className={cn(
                  "text-sm font-medium truncate transition-colors",
                  styles.text,
                  styles.hover,
                  "underline-offset-4 hover:underline"
                )}
              >
                {announcement.isPinned && (
                  <span className="inline-flex items-center gap-1 mr-2">
                    <Pin className="h-3 w-3" />
                    <span className="text-xs font-bold">PINNED</span>
                  </span>
                )}
                {announcement.title}
              </Link>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className={cn(
                "shrink-0 p-1 rounded-md transition-colors",
                styles.icon,
                styles.hover
              )}
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
