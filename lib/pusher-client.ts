import PusherClient from "pusher-js";

// Global singleton instance for Pusher client
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "ap2";

  if (!key) {
    console.warn("NEXT_PUBLIC_PUSHER_KEY is missing. Real-time client disabled.");
    return null;
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(key, {
      cluster,
    });
  }

  return pusherClientInstance;
}
