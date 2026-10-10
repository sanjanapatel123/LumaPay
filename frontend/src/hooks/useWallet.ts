"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, unwrapResponse } from "@/lib/api";
import type { TopUp, Wallet } from "@/types/wallet";

function normalizeTopUps(response: any): TopUp[] {
  const result = unwrapResponse<any>(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.topUps)) return result.topUps;
  if (Array.isArray(result?.topups)) return result.topups;

  return [];
}

export function useWallet(token: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshWallet = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [walletResponse, topUpsResponse] = await Promise.all([
        apiRequest<any>("/wallet", token),
        apiRequest<any>("/topups", token),
      ]);

      const walletResult = unwrapResponse<any>(walletResponse);
      const walletData: Wallet = walletResult.wallet ?? walletResult;

      setWallet(walletData);

      setWallet(walletData);
      setTopUps(normalizeTopUps(topUpsResponse));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load wallet data.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void refreshWallet();
    }
  }, [token, refreshWallet]);

  return {
    wallet,
    topUps,
    loading,
    error,
    setWallet,
    refreshWallet,
  };
}
