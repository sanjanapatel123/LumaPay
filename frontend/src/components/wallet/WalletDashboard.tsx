"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { apiRequest } from "@/lib/api";
import useSocket from "@/hooks/useSocket";

type WalletData = {
  balancePaise: number;
  balanceRupees?: number;
};

type TopUp = {
  _id?: string;
  id?: string;
  amountPaise: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  updatedAt?: string;
};

type WalletResponse = {
  wallet?: WalletData;
  balancePaise?: number;
  balanceRupees?: number;
};

type TopUpsResponse = {
  topUps?: TopUp[];
  topups?: TopUp[];
};

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusPill({ status }: { status: TopUp["status"] }) {
  const styles = {
    SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    FAILED: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  const dotStyles = {
    SUCCESS: "bg-emerald-500",
    PENDING: "bg-amber-500",
    FAILED: "bg-rose-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
      {status === "SUCCESS"
        ? "Successful"
        : status === "PENDING"
          ? "Pending"
          : "Failed"}
    </span>
  );
}

function WalletDashboardContent() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [updatedLive, setUpdatedLive] = useState(false);

  const loadWallet = useCallback(async (authToken: string) => {
    const response = await apiRequest<WalletResponse>("/wallet", authToken);

    const data = response.wallet ?? response;

    if (typeof data.balancePaise === "number") {
      setWallet(data as WalletData);
    }
  }, []);

  const loadTopUps = useCallback(async (authToken: string) => {
    const response = await apiRequest<TopUpsResponse | TopUp[]>(
      "/topups",
      authToken,
    );

    const items = Array.isArray(response)
      ? response
      : (response.topUps ?? response.topups ?? []);

    setTopUps(items);
  }, []);

  const refreshDashboard = useCallback(
    async (authToken: string) => {
      await Promise.all([loadWallet(authToken), loadTopUps(authToken)]);
    },
    [loadWallet, loadTopUps],
  );

  const handleBalanceUpdate = useCallback(
    (update: { balancePaise: number; balanceRupees: number }) => {
      setWallet({
        balancePaise: update.balancePaise,
        balanceRupees: update.balanceRupees,
      });
      setUpdatedLive(true);
    },
    [],
  );

  useSocket({
    token,
    onBalanceUpdate: handleBalanceUpdate,
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("wallet_token");

    if (!savedToken) {
      router.replace("/login");
      return;
    }

    setToken(savedToken);

    const load = async () => {
      try {
        await refreshDashboard(savedToken);
      } catch (err) {
        if (err instanceof Error && "status" in err && err.status === 401) {
          localStorage.removeItem("wallet_token");
          router.replace("/login");
          return;
        }

        setError(
          err instanceof Error ? err.message : "Unable to load your wallet.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [refreshDashboard, router]);

  // After returning from the mock gateway, confirm the final payment status.
  useEffect(() => {
    if (!token) return;

    const params = new URLSearchParams(window.location.search);
    const topupId = params.get("topupId");
    const returnedFromGateway = params.get("return") === "1";

    if (!topupId || !returnedFromGateway) return;

    setConfirming(true);
    setNotice("Payment received by gateway. Confirming your wallet update...");

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const checkPayment = async () => {
      if (stopped) return;

      try {
        const response = await apiRequest<{
          topUp?: { status: TopUp["status"] };
          status?: TopUp["status"];
        }>(`/topups/${topupId}`, token);

        const payment = response.topUp ?? response;
        const status = payment.status;

        if (status === "SUCCESS" || status === "FAILED") {
          await refreshDashboard(token);

          if (stopped) return;

          setConfirming(false);
          setNotice(
            status === "SUCCESS"
              ? "Payment successful! Your wallet balance has been updated."
              : "This payment failed. Your wallet balance has not been credited.",
          );

          window.history.replaceState({}, "", "/");
          return;
        }
      } catch {
        // Retry while the backend is processing the gateway webhook.
      }

      attempts += 1;

      if (attempts < 40 && !stopped) {
        timer = setTimeout(checkPayment, 1500);
      } else {
        setConfirming(false);
        setNotice(
          "Payment confirmation is taking longer than expected. Refresh your wallet to check the latest status.",
        );
      }
    };

    void checkPayment();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [token, refreshDashboard]);

  async function handleAddMoney(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const rupees = Number(amount);

    if (!Number.isSafeInteger(rupees) || rupees < 100 || rupees > 50000) {
      setError("Enter a whole-rupee amount between ₹100 and ₹50,000.");
      return;
    }

    setCreating(true);

    try {
      const response = await apiRequest<{
        gatewayUrl: string;
        topUp?: TopUp;
      }>("/topups", token, {
        method: "POST",
        body: JSON.stringify({ amount: rupees * 100 }),
      });

      if (!response.gatewayUrl) {
        throw new Error("Payment gateway URL was not returned.");
      }

      window.location.assign(response.gatewayUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start your payment.",
      );
      setCreating(false);
    }
  }

  async function handleRefresh() {
    if (!token) return;

    setError("");

    try {
      await refreshDashboard(token);
      setUpdatedLive(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed.");
    }
  }

  const balance = wallet?.balancePaise ?? 0;
  const successful = topUps.filter((item) => item.status === "SUCCESS");
  const pending = topUps.filter((item) => item.status === "PENDING");
  const failed = topUps.filter((item) => item.status === "FAILED");
  const totalAdded = successful.reduce(
    (total, item) => total + item.amountPaise,
    0,
  );
  const recentTopUps = [...topUps]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#EAE2FC] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8264D2]">
              <Sparkles size={12} />
              Your financial space
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#261D3B] sm:text-[34px]">
              Wallet overview
            </h1>
            <p className="mt-2 text-sm text-[#898196]">
              Your money, your activity, all in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-xl border border-[#EDE7F5] bg-white px-3.5 py-2.5 text-xs font-medium text-[#766D88] sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Wallet secured
            </div>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9E2F5] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#6E6383] shadow-sm transition hover:border-[#CDBDF4] hover:text-[#7656D5] disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              aria-label="Help"
              title="Wallet help"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E9E2F5] bg-white text-[#817690] transition hover:bg-[#F7F3FF] hover:text-[#7656D5]"
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </section>

        {/* Notifications */}
        {(notice || error || confirming) && (
          <div
            role={error ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${
              error
                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-[#E8DFFF] bg-[#F8F5FF] text-[#6D54B2]"
            }`}
          >
            {confirming ? (
              <LoaderCircle
                size={18}
                className="mt-0.5 shrink-0 animate-spin"
              />
            ) : error ? (
              <CircleHelp size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <div className="flex-1 leading-6">{error || notice}</div>
            {error && (
              <button
                type="button"
                onClick={() => setError("")}
                className="text-xs font-bold"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Main balance and add-money section */}
        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="relative isolate min-h-[300px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#9B80EF] via-[#8261DD] to-[#6245B8] p-6 text-white shadow-[0_22px_55px_-28px_rgba(112,79,201,0.65)] sm:p-8 lg:p-9">
            <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-6 -top-12 -z-10 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute bottom-[-115px] right-[22%] -z-10 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Wallet size={17} />
                  </span>
                  Available balance
                </div>
                <div className="mt-7 text-4xl font-bold tracking-tight sm:text-[48px]">
                  {loading ? (
                    <LoaderCircle size={34} className="animate-spin" />
                  ) : (
                    formatINR(balance)
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/75">
                  <ShieldCheck size={14} />
                  Your current wallet balance
                </div>
              </div>

              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:flex">
                <CreditCard size={23} />
              </div>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/wallet")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-[#7151CA] shadow-lg shadow-[#4F35A0]/20 transition hover:-translate-y-0.5 hover:bg-[#FAF8FF]"
              >
                <Plus size={16} />
                Add money
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => router.push("/transactions")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                View activity
              </button>
            </div>

            <div className="mt-7 flex items-center gap-2 border-t border-white/15 pt-4 text-[11px] text-white/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={12} />
              </span>
              Payments are credited after server-side confirmation
              {updatedLive && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 font-semibold text-emerald-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Quick add money */}
          <div className="rounded-[30px] border border-[#EDE7F6] bg-white p-6 shadow-[0_10px_35px_-25px_rgba(47,31,80,0.25)] sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9275D9]">
                  Quick action
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#2C2340]">
                  Add money
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-[#938AA2]">
                  Top up your wallet in a few simple steps.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1ECFF] text-[#8261DD]">
                <Zap size={20} />
              </div>
            </div>

            <form onSubmit={handleAddMoney} className="mt-6">
              <label
                htmlFor="dashboard-amount"
                className="text-xs font-semibold text-[#5C526E]"
              >
                Enter amount
              </label>

              <div className="mt-2 flex items-center rounded-2xl border border-[#E8E1F3] bg-[#FCFBFF] px-4 transition focus-within:border-[#AD96EF] focus-within:ring-4 focus-within:ring-[#9274E8]/10">
                <span className="text-xl font-semibold text-[#A49AB5]">₹</span>
                <input
                  id="dashboard-amount"
                  type="number"
                  min={100}
                  max={50000}
                  step={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-4 text-xl font-bold text-[#332747] outline-none"
                  placeholder="500"
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(String(value))}
                    className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                      amount === String(value)
                        ? "border-[#B5A0F3] bg-[#F2EDFF] text-[#7857D5]"
                        : "border-[#EEE9F6] bg-white text-[#7F758F] hover:border-[#CBBBF4] hover:bg-[#FCFAFF]"
                    }`}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {error && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={creating || !token}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8060D8] px-4 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-200/70 transition hover:-translate-y-0.5 hover:bg-[#704FC9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {creating ? "Preparing payment..." : "Continue to payment"}
              </button>
              <p className="mt-3 text-center text-[10px] text-[#A098AF]">
                Minimum ₹100 · Maximum ₹50,000 per top-up
              </p>
            </form>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#EEE8F6] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8D849C]">
                Total added
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowDownLeft size={18} />
              </span>
            </div>
            <p className="mt-4 text-[24px] font-bold tracking-tight text-[#302644]">
              {loading ? "—" : formatINR(totalAdded)}
            </p>
            <p className="mt-1.5 text-[11px] text-[#A098AF]">
              From successful top-ups
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEE8F6] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8D849C]">
                Successful payments
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#8565DB]">
                <CheckCircle2 size={18} />
              </span>
            </div>
            <p className="mt-4 text-[24px] font-bold tracking-tight text-[#302644]">
              {loading ? "—" : successful.length}
            </p>
            <p className="mt-1.5 text-[11px] text-[#A098AF]">
              Confirmed transactions
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEE8F6] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8D849C]">
                Pending payments
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={18} />
              </span>
            </div>
            <p className="mt-4 text-[24px] font-bold tracking-tight text-[#302644]">
              {loading ? "—" : pending.length}
            </p>
            <p className="mt-1.5 text-[11px] text-[#A098AF]">
              Awaiting final confirmation
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEE8F6] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8D849C]">
                Failed payments
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ArrowUpRight size={18} />
              </span>
            </div>
            <p className="mt-4 text-[24px] font-bold tracking-tight text-[#302644]">
              {loading ? "—" : failed.length}
            </p>
            <p className="mt-1.5 text-[11px] text-[#A098AF]">
              Payments not credited
            </p>
          </div>
        </section>

        {/* Recent activity */}
        <section className="overflow-hidden rounded-[26px] border border-[#EEE8F6] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#F0ECF6] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#302644]">
                Recent activity
              </h2>
              <p className="mt-1 text-xs text-[#948BA3]">
                A quick look at your latest wallet top-ups.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/transactions")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8060D8] transition hover:text-[#6345B8]"
            >
              View all transactions
              <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-[#8D849C]">
              <LoaderCircle size={18} className="animate-spin" />
              Loading your wallet activity...
            </div>
          ) : recentTopUps.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#8261DD]">
                <Wallet size={24} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-[#302644]">
                Your wallet journey starts here
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#938AA2]">
                No top-ups yet. Add money to your wallet and your payment
                activity will appear here.
              </p>
              <button
                type="button"
                onClick={() => router.push("/wallet")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8060D8] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#704FC9]"
              >
                <Plus size={15} />
                Add your first top-up
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F2EEF7]">
              {recentTopUps.map((item, index) => {
                const id = item._id ?? item.id ?? `${item.createdAt}-${index}`;

                return (
                  <div
                    key={id}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#FDFCFF] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          item.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-600"
                            : item.status === "PENDING"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {item.status === "SUCCESS" ? (
                          <ArrowDownLeft size={19} />
                        ) : item.status === "PENDING" ? (
                          <Clock3 size={19} />
                        ) : (
                          <ArrowUpRight size={19} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#3A304C]">
                          Wallet top-up
                        </p>
                        <p className="mt-1 truncate text-[11px] text-[#9A91A9]">
                          {formatDate(item.createdAt)}
                          {(item._id || item.id) && (
                            <span>
                              {" "}
                              · ID: {(item._id ?? item.id)?.slice(-8)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-[#302644]">
                          +{formatINR(item.amountPaise)}
                        </p>
                        <div className="mt-1.5">
                          <StatusPill status={item.status} />
                        </div>
                      </div>
                      <button
                        type="button"
                        title="View all transactions"
                        aria-label="View all transactions"
                        onClick={() => router.push("/transactions")}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#EEE8F6] text-[#9287A7] transition hover:border-[#D1C1F7] hover:bg-[#F4EFFF] hover:text-[#7857D5]"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECF6] bg-[#FCFBFE] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2 text-[11px] text-[#938AA2]">
              <ShieldCheck size={14} className="text-[#8B6BDE]" />
              Payments are credited only after verified confirmation.
            </div>
            <button
              type="button"
              onClick={() => router.push("/transactions")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8060D8] hover:text-[#6244B8]"
            >
              Full history <ArrowRight size={13} />
            </button>
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}

export default function WalletDashboard() {
  return <WalletDashboardContent />;
}
