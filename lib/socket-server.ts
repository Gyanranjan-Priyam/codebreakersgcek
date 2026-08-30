/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Server as SocketIOServer } from "socket.io";

/**
 * Get the Socket.IO server instance from the global scope if present in current thread.
 */
function getIO(): SocketIOServer | null {
  return (globalThis as any).__socketio || null;
}

function getCandidateUrls(): string[] {
  const urls = [
    process.env.NEXT_PUBLIC_APP_URL,
    `http://127.0.0.1:${process.env.PORT || 3000}`,
    `http://localhost:${process.env.PORT || 3000}`,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  return Array.from(new Set(urls.map((u) => u.replace(/\/$/, ""))));
}

/**
 * Emit a Socket.IO event to a specific room (channel).
 * Works reliably from Next.js App Router, Server Actions, Route Handlers, and background jobs.
 *
 * @param room - The room/channel to emit to (e.g., "user-abc123", "leaderboard")
 * @param event - The event name (e.g., "attendance-marked", "task-evaluated")
 * @param data - The event payload
 */
export async function emitSocketEvent(room: string, event: string, data: any): Promise<void> {
  try {
    let emitted = false;
    const io = getIO();
    if (io) {
      io.to(room).emit(event, data);
      emitted = true;
    }

    // Always attempt the HTTP broadcast bridge to guarantee delivery across isolated Next.js worker scopes
    const candidateUrls = getCandidateUrls();
    for (const url of candidateUrls) {
      try {
        const res = await fetch(`${url}/api/socket/emit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room, event, data }),
          cache: "no-store",
        });
        if (res.ok) {
          emitted = true;
          break;
        }
      } catch {
        // Try next candidate URL
      }
    }

    if (!emitted) {
      console.warn(`⚠️ Socket.IO broadcast warning: Event "${event}" for room "${room}" could not be bridged.`);
    }
  } catch (error: any) {
    console.error("Socket.IO emit error:", error?.message || error);
  }
}

/**
 * Emit events to multiple rooms at once (batch emit).
 */
export async function emitSocketEventToRooms(
  rooms: string[],
  event: string,
  data: any
): Promise<void> {
  try {
    let emitted = false;
    const io = getIO();
    if (io) {
      io.to(rooms).emit(event, data);
      emitted = true;
    }

    const candidateUrls = getCandidateUrls();
    for (const url of candidateUrls) {
      try {
        const res = await fetch(`${url}/api/socket/emit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rooms, event, data }),
          cache: "no-store",
        });
        if (res.ok) {
          emitted = true;
          break;
        }
      } catch {
        // Try next candidate URL
      }
    }

    if (!emitted) {
      console.warn(`⚠️ Socket.IO batch emit warning for event "${event}".`);
    }
  } catch (error: any) {
    console.error("Socket.IO batch emit error:", error?.message || error);
  }
}
