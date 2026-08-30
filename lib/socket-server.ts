/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Server as SocketIOServer } from "socket.io";

/**
 * Get the Socket.IO server instance from the global scope.
 * This is set by the /api/socketio endpoint when the server initializes.
 */
function getIO(): SocketIOServer | null {
  return (globalThis as any).__socketio || null;
}

/**
 * Emit a Socket.IO event to a specific room (channel).
 * This is the server-side equivalent of Pusher's triggerPusherEvent.
 *
 * @param room - The room/channel to emit to (e.g., "quiz-abc123", "system-SYS-123456")
 * @param event - The event name (e.g., "system-updated", "quiz-started")
 * @param data - The event payload
 */
export async function emitSocketEvent(room: string, event: string, data: any): Promise<void> {
  try {
    let io = getIO();
    if (io) {
      io.to(room).emit(event, data);
      return;
    }

    // Fallback: if the Socket.IO server hasn't been initialized yet via the API route,
    // try to initialize it by making an internal request, then retry
    const fallbackUrls = [
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean) as string[];

    for (const url of fallbackUrls) {
      try {
        const cleanUrl = url.replace(/\/$/, "");
        await fetch(`${cleanUrl}/api/socketio`, { cache: "no-store" });
        io = getIO();
        if (io) {
          io.to(room).emit(event, data);
          return;
        }
      } catch {
        // Try next fallback
      }
    }

    // Silent fallback
    console.warn(`⚠️ Socket.IO server not available. Event "${event}" to room "${room}" was not sent.`);
  } catch (error: any) {
    console.error("Socket.IO emit error:", error?.message || error);
  }
}

/**
 * Emit events to multiple rooms at once (batch emit).
 * Useful for startAllSystems where we need to notify each system individually.
 */
export async function emitSocketEventToRooms(
  rooms: string[],
  event: string,
  data: any
): Promise<void> {
  const io = getIO();
  if (!io) {
    console.warn(`⚠️ Socket.IO server not available for batch emit.`);
    return;
  }

  for (const room of rooms) {
    io.to(room).emit(event, data);
  }
}
