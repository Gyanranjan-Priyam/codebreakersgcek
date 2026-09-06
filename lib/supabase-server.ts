/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let mainServerClient: SupabaseClient | null = null;
let quizServerClient: SupabaseClient | null = null;

function getMainServerClient(): SupabaseClient {
  if (!mainServerClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    mainServerClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return mainServerClient;
}

function getQuizServerClient(): SupabaseClient {
  if (!quizServerClient) {
    const url =
      process.env.NEXT_PUBLIC_QUIZ_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "";
    const key =
      process.env.QUIZ_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_QUIZ_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    quizServerClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return quizServerClient;
}

/**
 * Broadcast an event to all connected clients in a Supabase Realtime channel.
 * Uses httpSend for server-side REST delivery to avoid WebSocket connection overhead and deprecation warnings.
 */
export async function emitRealtimeEvent(
  channelName: string,
  eventName: string,
  payload: any,
  clientType: "main" | "quiz" = "main"
): Promise<void> {
  try {
    const client = clientType === "quiz" ? getQuizServerClient() : getMainServerClient();
    const channel = client.channel(channelName);

    if (typeof (channel as any).httpSend === "function") {
      await (channel as any).httpSend(eventName, payload);
    } else {
      await channel.send({
        type: "broadcast",
        event: eventName,
        payload,
      });
    }

    // Clean up transient server channel
    await client.removeChannel(channel);
  } catch (error) {
    console.error(`❌ [SupabaseServer] Failed to broadcast event "${eventName}" to "${channelName}":`, error);
  }
}

/**
 * Broadcast an event to multiple channels simultaneously.
 */
export async function emitRealtimeEventToRooms(
  channelNames: string[],
  eventName: string,
  payload: any,
  clientType: "main" | "quiz" = "main"
): Promise<void> {
  await Promise.all(
    channelNames.map((channelName) =>
      emitRealtimeEvent(channelName, eventName, payload, clientType)
    )
  );
}
