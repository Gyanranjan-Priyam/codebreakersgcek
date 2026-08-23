/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";

interface SocketNextApiResponse extends NextApiResponse {
  socket: NextApiResponse["socket"] & {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: SocketNextApiResponse) {
  if (!res.socket.server.io) {
    console.log("🔌 Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      // Performance tuning for 500+ concurrent connections
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      maxHttpBufferSize: 1e6,
      transports: ["websocket", "polling"],
      // Allow upgrades from polling to websocket
      allowUpgrades: true,
    });

    io.on("connection", (socket) => {
      // Join a room (channel equivalent)
      socket.on("join-room", (room: string) => {
        socket.join(room);
      });

      // Leave a room
      socket.on("leave-room", (room: string) => {
        socket.leave(room);
      });

      // Join multiple rooms at once (for admin dashboards)
      socket.on("join-rooms", (rooms: string[]) => {
        rooms.forEach((room) => socket.join(room));
      });

      socket.on("disconnect", () => {
        // Cleanup is automatic — Socket.IO removes from all rooms on disconnect
      });
    });

    res.socket.server.io = io;
    (globalThis as any).__socketio = io;

    console.log("✅ Socket.IO server initialized successfully");
  } else {
    // Ensure global reference is always up to date
    (globalThis as any).__socketio = res.socket.server.io;
  }

  res.end();
}
