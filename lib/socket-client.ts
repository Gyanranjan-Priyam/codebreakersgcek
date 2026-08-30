/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";

// Global singleton Socket.IO client instance
let socketInstance: Socket | null = null;
let initPromise: Promise<Socket | null> | null = null;

// Track all active room subscriptions so they can be re-joined on reconnect
const activeRooms = new Set<string>();

/**
 * Initialize and return the Socket.IO client singleton.
 * On first call, hits /api/socketio to ensure the server is running,
 * then establishes the WebSocket connection.
 * Subsequent calls return the existing connection instantly.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (socketInstance?.connected) return socketInstance;

  if (!socketInstance) {
    socketInstance = io({
      path: "/api/socketio",
      addTrailingSlash: false,
      // Performance: prefer WebSocket, fall back to polling
      transports: ["websocket", "polling"],
      // Reconnection settings for reliability at scale
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Timeout settings
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      // Re-join all active rooms on connect or reconnection
      activeRooms.forEach((room) => {
        socketInstance?.emit("join-room", room);
      });
    });

    socketInstance.on("disconnect", () => {});
    socketInstance.on("connect_error", () => {});
  }

  return socketInstance;
}

/**
 * Initialize the Socket.IO connection by first ensuring the server endpoint is ready.
 * Call this once on app mount or before first use.
 */
export async function initSocket(): Promise<Socket | null> {
  if (typeof window === "undefined") return null;
  if (socketInstance?.connected) return socketInstance;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Hit the API endpoint to ensure Socket.IO server is initialized
      await fetch("/api/socketio");
    } catch {
      // Endpoint may not respond with body, that's fine
    }
    return getSocket();
  })();

  return initPromise;
}

/**
 * Subscribe to a room (equivalent to Pusher channel).
 * Returns a cleanup function to leave the room.
 */
export function joinRoom(room: string): () => void {
  if (!room) return () => {};

  activeRooms.add(room);
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit("join-room", room);
  }

  return () => {
    activeRooms.delete(room);
    const s = getSocket();
    if (s?.connected) {
      s.emit("leave-room", room);
    }
  };
}

/**
 * Subscribe to an event on the socket.
 * Returns a cleanup function to remove the listener.
 */
export function onSocketEvent(event: string, callback: (...args: any[]) => void): () => void {
  const socket = getSocket();
  if (socket) {
    socket.on(event, callback);
  }
  return () => {
    const s = getSocket();
    if (s) {
      s.off(event, callback);
    }
  };
}

/**
 * Disconnect and cleanup the socket instance.
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    initPromise = null;
    activeRooms.clear();
  }
}

