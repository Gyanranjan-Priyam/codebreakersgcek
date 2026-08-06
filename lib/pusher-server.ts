import PusherServer from "pusher";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

/**
 * Safely trigger a Pusher event on the server
 */
export async function triggerPusherEvent(channel: string, event: string, data: any) {
  try {
    if (!process.env.PUSHER_APP_ID && !process.env.NEXT_PUBLIC_PUSHER_KEY) {
      return;
    }
    await pusherServer.trigger(channel, event, data);
  } catch (error: any) {
    if (error?.status === 401 && error?.body?.includes("Timestamp expired")) {
      console.warn(
        "⚠️ Pusher 401 Warning: System clock skew detected. Please sync your Windows system clock in Settings -> Date & Time -> 'Sync Now'."
      );
    } else {
      console.error("Pusher trigger error:", error?.message || error);
    }
  }
}
