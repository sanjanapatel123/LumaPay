import { Server } from "socket.io";

let io: Server | null = null;

export function setSocketServer(server: Server): void {
  io = server;
}

export function emitBalanceUpdate(userId: string, balancePaise: number): void {
  if (!io) {
    console.warn("Socket.IO server is not initialized");
    return;
  }

  io.to(`user:${userId}`).emit("wallet:balance-updated", {
    balancePaise,
    balanceRupees: balancePaise / 100,
  });
}
