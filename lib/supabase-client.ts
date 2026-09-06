/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

// Singleton client instances
let mainSupabaseClient: SupabaseClient | null = null;
let quizSupabaseClient: SupabaseClient | null = null;

// Track active channels for automatic cleanup
const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Returns the browser client for the Main Supabase project (Attendance, Leaderboard, Points).
 */
export function getMainSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }

  if (!mainSupabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn("⚠️ [SupabaseClient] Main Supabase URL or Anon Key is missing");
    }

    mainSupabaseClient = createClient(url || "", anonKey || "", {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return mainSupabaseClient;
}

/**
 * Returns the browser client for the Dedicated Quiz / Exam Supabase project (Live CBT Exams, Kiosks).
 */
export function getQuizSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return createClient(
      process.env.NEXT_PUBLIC_QUIZ_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_QUIZ_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }

  if (!quizSupabaseClient) {
    const url = process.env.NEXT_PUBLIC_QUIZ_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_QUIZ_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn("⚠️ [SupabaseClient] Quiz Supabase URL or Anon Key is missing");
    }

    quizSupabaseClient = createClient(url || "", anonKey || "", {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  }

  return quizSupabaseClient;
}

/**
 * Helper to subscribe to a broadcast event on a Supabase Realtime channel.
 * Returns a cleanup function that automatically removes the channel when components unmount.
 */
export function subscribeToBroadcast(
  channelName: string,
  eventName: string,
  callback: (payload: any) => void,
  clientType: "main" | "quiz" = "main"
): () => void {
  const client = clientType === "quiz" ? getQuizSupabaseClient() : getMainSupabaseClient();
  const key = `${clientType}:${channelName}`;

  let channel = activeChannels.get(key);
  if (!channel) {
    channel = client.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });
    activeChannels.set(key, channel);
  }

  channel.on("broadcast", { event: eventName }, (eventObj) => {
    callback(eventObj.payload);
  });

  // Subscribe channel if not already joined
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log(`🔌 [SupabaseRealtime] Subscribed to channel: ${channelName} (${clientType})`);
    }
  });

  // Return cleanup function
  return () => {
    const ch = activeChannels.get(key);
    if (ch) {
      client.removeChannel(ch).then(() => {
        activeChannels.delete(key);
        console.log(`🔌 [SupabaseRealtime] Left channel: ${channelName} (${clientType})`);
      });
    }
  };
}
