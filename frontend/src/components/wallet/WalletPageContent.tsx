"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { apiRequest } from "@/lib/api";

type WalletData = {
  balancePaise: number;
  balanceRupees?: number;
};

type WalletApiResponse = {
  wallet?: WalletData;
  balancePaise?: number;
  balanceRupees?: number;
};

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function WalletPageInner() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadWallet = useCallback(
    async (authToken: string) => {
      try {
        const result = await apiRequest<WalletApiResponse>(
          "/wallet",
          authToken,
        );
        const data = result.wallet ?? result;

        if (typeof data.balancePaise === "number") {
          setWallet(data as WalletData);
        }
      } catch (err) {
        if (err instanceof Error && "status" in err && err.status === 401) {
          localStorage.removeItem("wallet_token");
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load wallet.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("wallet_token");
    if (!savedToken) {
      router.replace("/login");
      return;
    }
    setToken(savedToken);
    void loadWallet(savedToken);
  }, [loadWallet, router]);

  async function handleAddMoney(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const rupees = Number(amount);
    if (!Number.isSafeInteger(rupees) || rupees < 100 || rupees > 50000) {
      setError("Enter a whole-rupee amount between ₹100 and ₹50,000.");
      return;
    }

    setCreating(true);
    try {
      const result = await apiRequest<{
        gatewayUrl: string;
        topUp?: { id?: string };
      }>("/topups", token, {
        method: "POST",
        body: JSON.stringify({ amount: rupees * 100 }),
      });

      if (!result.gatewayUrl) {
        throw new Error("The payment gateway URL was not returned.");
      }

      window.location.assign(result.gatewayUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start top-up.");
      setCreating(false);
    }
  }

  const balance = wallet?.balancePaise ?? 0;

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A70D5]">
              Your finances
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#251D3A]">
              My Wallet
            </h1>
            <p className="mt-2 text-sm text-[#827B91]">
              Manage your balance and add money securely.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E9E2F7] bg-white px-3.5 py-2 text-xs font-semibold text-[#76668F] shadow-sm">
            <ShieldCheck size={15} className="text-[#8A6BDE]" />
            Secure wallet
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#8F70E5] via-[#8060D8] to-[#6044B6] p-7 text-white shadow-xl shadow-violet-200/60 sm:p-9">
            <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-8 h-44 w-44 rounded-full border border-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-medium text-white/75">
                <Wallet size={17} />
                Available balance
              </div>
              <div className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                {loading ? (
                  <LoaderCircle className="animate-spin" size={32} />
                ) : (
                  formatINR(balance)
                )}
              </div>
              <p className="mt-3 text-sm text-white/70">
                Your current wallet balance
              </p>
              <div className="mt-9 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs text-white/85">
                <CheckCircle2 size={16} />
                Balance updates after payment confirmation
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#EEE9F6] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1ECFF] text-[#8261DC]">
                <Plus size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2B2340]">Add money</h2>
                <p className="mt-1 text-xs leading-5 text-[#8B8399]">
                  Choose an amount to start a top-up.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddMoney} className="mt-6 space-y-4">
              <label
                htmlFor="wallet-amount"
                className="block text-xs font-semibold text-[#5F566F]"
              >
                Amount (INR)
              </label>
              <div className="flex items-center rounded-xl border border-[#E8E1F4] bg-[#FCFBFF] px-4 transition focus-within:border-[#A58AEF] focus-within:ring-4 focus-within:ring-[#9274E8]/10">
                <span className="text-lg font-semibold text-[#9589AB]">₹</span>
                <input
                  id="wallet-amount"
                  type="number"
                  min={100}
                  max={50000}
                  step={1}
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full border-0 bg-transparent px-3 py-4 text-lg font-bold text-[#302645] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(String(value))}
                    className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                      amount === String(value)
                        ? "border-[#B5A0F3] bg-[#F3EFFF] text-[#7656D5]"
                        : "border-[#EEE9F6] bg-white text-[#766D88] hover:border-[#C9B9F4]"
                    }`}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
                >
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={creating || !token}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8060D8] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-[#704FC9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {creating ? "Preparing payment..." : "Continue to payment"}
              </button>
              <p className="text-center text-[11px] text-[#9A91A8]">
                Minimum ₹100 · Maximum ₹50,000 per top-up
              </p>
            </form>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EEE9F6] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8A8298]">
              <CircleDollarSign size={16} className="text-[#9274E8]" />
              Available funds
            </div>
            <p className="mt-3 text-xl font-bold text-[#2B2340]">
              {loading ? "—" : formatINR(balance)}
            </p>
            <p className="mt-1 text-xs text-[#9A91A8]">Ready to use</p>
          </div>
          <div className="rounded-2xl border border-[#EEE9F6] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8A8298]">
              <ArrowDownLeft size={16} className="text-emerald-500" />
              Add money
            </div>
            <p className="mt-3 text-sm font-bold text-[#2B2340]">
              Instant request
            </p>
            <p className="mt-1 text-xs text-[#9A91A8]">
              Payment confirmation may take a few seconds
            </p>
          </div>
          <div className="rounded-2xl border border-[#EEE9F6] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8A8298]">
              <ArrowUpRight size={16} className="text-[#9274E8]" />
              Activity
            </div>
            <button
              type="button"
              onClick={() => router.push("/transactions")}
              className="mt-3 text-sm font-bold text-[#7857D5] hover:text-[#5E40B8]"
            >
              View transactions →
            </button>
            <p className="mt-1 text-xs text-[#9A91A8]">
              Review payment status and history
            </p>
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}

export default function WalletPageContent() {
  return (
    <ProtectedRoute>
      <WalletPageInner />
    </ProtectedRoute>
  );
}
