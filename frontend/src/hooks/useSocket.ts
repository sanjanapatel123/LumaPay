"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import type { BalanceUpdate } from "@/types/wallet";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface UseSocketOptions {
  token: string;
  onBalanceUpdate: (update: BalanceUpdate) => void;
}

export default function useSocket({
  token,
  onBalanceUpdate,
}: UseSocketOptions) {
  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on("wallet:balance-updated", onBalanceUpdate);

    return () => {
      socket.off("wallet:balance-updated", onBalanceUpdate);
      socket.disconnect();
    };
  }, [token, onBalanceUpdate]);
}
