"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { initSocket, joinRoom, onSocketEvent } from "@/lib/socket-client";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
  playAttendanceChime,
  isNotificationSupported,
  NotificationPermissionStatus,
} from "@/lib/browser-notifications";
import { toast } from "sonner";
import { Bell, CheckCircle2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AttendanceMarkedPayload {
  type: string;
  sessionId: string;
  sessionTitle: string;
  sessionNumber?: number;
  userId: string;
  userName: string;
  cbUserId?: string | null;
  points: number;
  status: string;
  timestamp: string;
  message?: string;
}

interface RealtimeAttendanceListenerProps {
  userId: string;
  cbUserId?: string | null;
  userName?: string;
}

export function RealtimeAttendanceListener({
  userId,
  cbUserId,
  userName,
}: RealtimeAttendanceListenerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [permission, setPermission] = useState<NotificationPermissionStatus>("unsupported");
  const [showPromptBanner, setShowPromptBanner] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Check initial notification permission
    if (isNotificationSupported()) {
      const currentPerm = getNotificationPermission();
      setPermission(currentPerm);

      // If permission is default and user hasn't dismissed before, ask or show subtle banner
      if (currentPerm === "default") {
        const dismissed = localStorage.getItem("cb_notif_prompt_dismissed");
        if (!dismissed) {
          setShowPromptBanner(true);
        }
      }
    }

    // Initialize Socket.IO connection and join personal rooms
    const cleanupFns: Array<() => void> = [];

    initSocket().then((socket) => {
      if (!socket) return;

      // Join primary user room and alias rooms
      cleanupFns.push(joinRoom(`user-${userId}`));
      cleanupFns.push(joinRoom(`user:${userId}`));
      if (cbUserId) {
        cleanupFns.push(joinRoom(`user-${cbUserId}`));
        cleanupFns.push(joinRoom(`user:${cbUserId}`));
      }

      // Handle Attendance Marked
      const attCleanup = onSocketEvent("attendance-marked", async (data: AttendanceMarkedPayload) => {
        if (!data) return;
        // Verify destination
        if (data.userId && data.userId !== userId && cbUserId && data.cbUserId !== cbUserId) {
          return;
        }

        // 1. Play audio chime
        playAttendanceChime();

        // 2. Display native browser push notification
        const sessionDisplay = data.sessionTitle || "Attendance Session";
        await showBrowserNotification("Attendance Marked Present! ✅", {
          body: `Hi ${data.userName || userName || "Member"}! You have been marked Present for "${sessionDisplay}". +${data.points || 10} Points added to your dashboard.`,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: `att-${data.sessionId}-${Date.now()}`,
          requireInteraction: false,
        });

        // 3. Show rich Sonner toast
        toast.success(
          <div className="flex items-start gap-3 w-full">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <span>Attendance Marked!</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  +{data.points || 10} PTS
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {sessionDisplay} • Real-time update applied.
              </p>
            </div>
          </div>,
          {
            duration: 8000,
            id: `att-toast-${data.sessionId}-${Date.now()}`,
          }
        );

        // 4. Silently refresh all Server Components on the dashboard
        startTransition(() => {
          router.refresh();
        });
      });
      cleanupFns.push(attCleanup);

      // Handle Task Evaluated
      const taskCleanup = onSocketEvent("task-evaluated", async (data: any) => {
        if (!data) return;
        if (data.userId && data.userId !== userId && cbUserId && data.cbUserId !== cbUserId) return;

        playAttendanceChime();
        await showBrowserNotification("Task Submission Evaluated! 📝", {
          body: `Task #${data.taskNumber || ""}: "${data.taskTitle || "Task"}" has been ${data.status} (+${data.points || 0} pts).`,
          icon: "/favicon.ico",
        });

        toast.info(
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Task Evaluated: {data.taskTitle}</p>
              <p className="text-[11px] text-muted-foreground">Status: {data.status} • +{data.points} pts</p>
            </div>
          </div>
        );

        startTransition(() => {
          router.refresh();
        });
      });
      cleanupFns.push(taskCleanup);
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [userId, cbUserId, userName, router]);

  const handleEnableNotifications = async () => {
    const newPerm = await requestNotificationPermission();
    setPermission(newPerm);
    setShowPromptBanner(false);

    if (newPerm === "granted") {
      playAttendanceChime();
      toast.success("Push notifications enabled!", {
        description: "You will receive real-time desktop notifications when your attendance is marked.",
      });
      await showBrowserNotification("Notifications Active! 🔔", {
        body: "You will now get real-time attendance alerts on your device.",
      });
    } else if (newPerm === "denied") {
      toast.info("Notifications blocked in browser", {
        description: "You can enable them anytime from your browser address bar settings.",
      });
    }
  };

  const handleDismissBanner = () => {
    setShowPromptBanner(false);
    localStorage.setItem("cb_notif_prompt_dismissed", "true");
  };

  if (!showPromptBanner || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] p-3.5 rounded-2xl bg-card/95 border border-primary/20 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Bell className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <span>Enable Attendance Alerts</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Get instant browser push notifications when admins scan your QR code.
          </p>
          <div className="flex items-center gap-2 pt-1.5">
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="h-7 text-xs px-3 rounded-lg cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              Enable Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismissBanner}
              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismissBanner}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
