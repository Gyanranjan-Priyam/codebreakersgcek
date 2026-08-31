/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";

// Global singleton Socket.IO client instance
let socketInstance: Socket | null = null;
let isInitializing = false;

// Track all active room subscriptions so they can be re-joined on reconnect
const activeRooms = new Set<string>();
const connectionListeners = new Set<(connected: boolean) => void>();

function notifyConnectionStatus(connected: boolean) {
  connectionListeners.forEach((cb) => {
    try {
      cb(connected);
    } catch {}
  });
}

/**
 * Initialize and return the Socket.IO client singleton.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (!socketInstance) {
    const origin = window.location.origin;
    socketInstance = io(origin, {
      path: "/api/socketio",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      console.log("🔌 [SocketClient] Connected to server, ID:", socketInstance?.id);
      notifyConnectionStatus(true);

      // Re-join all active rooms on connect or reconnection
      activeRooms.forEach((room) => {
        console.log(`🔌 [SocketClient] Joining room on connect: ${room}`);
        socketInstance?.emit("join-room", room);
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔌 [SocketClient] Disconnected:", reason);
      notifyConnectionStatus(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("🔌 [SocketClient] Connect error:", err.message);
      notifyConnectionStatus(false);
    });
  }

  return socketInstance;
}

/**
 * Initialize the Socket.IO connection by first ensuring the server endpoint is ready.
 */
export async function initSocket(): Promise<Socket | null> {
  if (typeof window === "undefined") return null;

  const socket = getSocket();
  if (socket?.connected) return socket;

  if (!isInitializing) {
    isInitializing = true;
    try {
      // Warm up the /api/socketio route on Next.js server
      await fetch("/api/socketio").catch(() => {});
    } finally {
      isInitializing = false;
    }
  }

  return socket;
}

/**
 * Subscribe to connection status changes.
 */
export function onSocketConnectionChange(callback: (connected: boolean) => void): () => void {
  connectionListeners.add(callback);
  const socket = getSocket();
  if (socket) {
    callback(socket.connected);
  }
  return () => {
    connectionListeners.delete(callback);
  };
}

/**
 * Subscribe to a room (channel).
 * Returns a cleanup function to leave the room.
 */
export function joinRoom(room: string): () => void {
  if (!room) return () => {};

  activeRooms.add(room);
  const socket = getSocket();

  if (socket?.connected) {
    console.log(`🔌 [SocketClient] Emitting join-room: ${room}`);
    socket.emit("join-room", room);
  }

  return () => {
    activeRooms.delete(room);
    const s = getSocket();
    if (s?.connected) {
      console.log(`🔌 [SocketClient] Emitting leave-room: ${room}`);
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
    activeRooms.clear();
    connectionListeners.clear();
  }
}
