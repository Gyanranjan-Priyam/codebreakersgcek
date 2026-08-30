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

async function readRequestBody(req: NextApiRequest): Promise<string> {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
  }
  return data;
}

export default async function handler(req: NextApiRequest, res: SocketNextApiResponse) {
  let io = res.socket.server.io;

  if (!io) {
    console.log("🔌 Initializing Socket.IO server on Node HTTP server...");

    io = new SocketIOServer(res.socket.server, {
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

      // Join multiple rooms at once
      socket.on("join-rooms", (rooms: string[]) => {
        rooms.forEach((room) => socket.join(room));
      });

      socket.on("disconnect", (reason) => {
        // Cleanup is automatic in Socket.IO
      });
    });

    res.socket.server.io = io;
    (globalThis as any).__socketio = io;

    console.log("✅ Socket.IO server initialized successfully");
  } else {
    // Ensure global reference is always up to date
    (globalThis as any).__socketio = io;
  }

  // Handle server-to-server broadcast requests via HTTP POST
  if (req.method === "POST") {
    try {
      const rawBody = await readRequestBody(req);
      if (rawBody) {
        const payload = JSON.parse(rawBody);
        const { room, rooms, event, data } = payload;

        if (event) {
          if (rooms && Array.isArray(rooms)) {
            rooms.forEach((r: string) => {
              io?.to(r).emit(event, data);
            });
          } else if (room) {
            io?.to(room).emit(event, data);
          }
        }
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Error broadcasting socket event:", err?.message || err);
      return res.status(500).json({ error: "Failed to broadcast socket event" });
    }
  }

  return res.status(200).json({ status: "Socket.IO server running" });
}
