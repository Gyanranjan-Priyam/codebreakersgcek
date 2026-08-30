/**
 * Browser Push Notification & Audio Chime Utility
 * Handles Web Notifications API permissions and displays native OS/browser push notifications.
 */

export type NotificationPermissionStatus = "granted" | "denied" | "default" | "unsupported";

/**
 * Check if the current browser environment supports the Notifications API.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current browser notification permission status.
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Request notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) return "unsupported";

  try {
    let perm: NotificationPermission;
    const req = Notification.requestPermission();
    if (req && typeof req.then === "function") {
      perm = await req;
    } else {
      perm = await new Promise<NotificationPermission>((resolve) => {
        Notification.requestPermission((p) => resolve(p));
      });
    }
    return perm as NotificationPermissionStatus;
  } catch (err) {
    console.warn("Error requesting notification permission:", err);
    return Notification.permission as NotificationPermissionStatus;
  }
}

// Global AudioContext reference
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a synthesized chime sound using the Web Audio API.
 */
export function playAttendanceChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Pleasant three-tone ascending chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.2, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.35);
    });
  } catch (e) {
    console.debug("Audio chime could not be played:", e);
  }
}

export interface BrowserNotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

/**
 * Show a native browser push notification.
 */
export async function showBrowserNotification(
  title: string,
  options: BrowserNotificationOptions
): Promise<Notification | null> {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;

  try {
    const defaultIcon = "/icon.png";
    const notifOptions: NotificationOptions = {
      body: options.body,
      icon: options.icon || defaultIcon,
      badge: options.badge || defaultIcon,
      tag: options.tag || `codebreakers-attendance-${Date.now()}`,
      requireInteraction: options.requireInteraction ?? false,
      data: options.data,
    };

    // ServiceWorker notification for progressive web apps
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notifOptions);
          return null;
        }
      } catch {
        // Fallback to standard constructor
      }
    }

    const notification = new Notification(title, notifOptions);

    notification.onclick = function () {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn("Could not display native notification:", err);
    return null;
  }
}
