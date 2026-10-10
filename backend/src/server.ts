import dotenv from "dotenv";
dotenv.config();

import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import app from "./app";
import { connectDB } from "./config/db";
import { setSocketServer } from "./sockets/io";

const PORT = Number(process.env.PORT) || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  },
});

setSocketServer(io);

io.use((socket, next) => {
  try {
    const secret = process.env.JWT_SECRET;
    const token = socket.handshake.auth?.token;

    if (!secret || typeof token !== "string") {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      return next(new Error("Invalid token"));
    }

    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.data.userId}`);
});

async function startServer(): Promise<void> {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Socket.IO ready");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void startServer();
