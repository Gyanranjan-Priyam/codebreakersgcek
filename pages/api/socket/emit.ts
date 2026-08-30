/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

interface SocketNextApiResponse extends NextApiResponse {
  socket: NextApiResponse["socket"] & {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
}

export default async function handler(req: NextApiRequest, res: SocketNextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const io: SocketIOServer | undefined = res.socket.server.io || (globalThis as any).__socketio;

    if (!io) {
      console.warn("⚠️ Socket.IO server instance not found on HTTP server.");
      return res.status(503).json({ error: "Socket.IO server not ready" });
    }

    const { room, rooms, event, data } = req.body || {};

    if (!event) {
      return res.status(400).json({ error: "Missing event name" });
    }

    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      io.to(rooms).emit(event, data);
    } else if (room) {
      io.to(room).emit(event, data);
    } else {
      io.emit(event, data);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/socket/emit:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
