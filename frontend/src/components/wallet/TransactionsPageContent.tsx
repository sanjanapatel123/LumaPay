"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

type TopUp = {
  _id?: string;
  id?: string;
  amountPaise: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
};

type TopUpsResponse = {
  topUps?: TopUp[];
  topups?: TopUp[];
};

type FilterType = "ALL" | PaymentStatus;

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function dateLabel(value: string) {
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

function TransactionsPageInner() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(
    async (authToken: string) => {
      setLoading(true);
      setError("");

      try {
        const result = await apiRequest<TopUpsResponse>("/topups", authToken);

        const list = Array.isArray(result)
          ? result
          : (result.topUps ?? result.topups ?? []);

        setTopUps(list);
      } catch (err) {
        if (err instanceof Error && "status" in err && err.status === 401) {
          localStorage.removeItem("wallet_token");
          router.replace("/login");
          return;
        }
        setError(
          err instanceof Error ? err.message : "Could not load transactions.",
        );
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
    void loadTransactions(savedToken);
  }, [loadTransactions, router]);

  const filteredTopUps = useMemo(() => {
    const query = search.trim().toLowerCase();

    return topUps.filter((item) => {
      const matchesFilter = filter === "ALL" || item.status === filter;
      const identifier = item._id ?? item.id ?? "";
      const matchesSearch =
        !query ||
        identifier.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        money(item.amountPaise).toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [topUps, filter, search]);

  const successCount = topUps.filter(
    (item) => item.status === "SUCCESS",
  ).length;
  const pendingCount = topUps.filter(
    (item) => item.status === "PENDING",
  ).length;
  const successfulAmount = topUps
    .filter((item) => item.status === "SUCCESS")
    .reduce((total, item) => total + item.amountPaise, 0);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All activity", value: "ALL" },
    { label: "Successful", value: "SUCCESS" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
  ];

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A70D5]">
              Wallet activity
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#251D3A]">
              Transactions
            </h1>
            <p className="mt-2 text-sm text-[#827B91]">
              Track every top-up and check its payment status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => token && void loadTransactions(token)}
            disabled={loading || !token}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E9E2F7] bg-white px-4 py-2.5 text-xs font-semibold text-[#675879] shadow-sm transition hover:border-[#C9B9F4] hover:text-[#7857D5] disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh activity
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EEE9F6] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8A8298]">
                Total top-ups
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1ECFF] text-[#8462DD]">
                <Wallet size={18} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#2B2340]">
              {topUps.length}
            </p>
            <p className="mt-1 text-xs text-[#9A91A8]">
              All recorded payment orders
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEE9F6] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8A8298]">
                Successful top-ups
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowDownLeft size={18} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#2B2340]">
              {successCount}
            </p>
            <p className="mt-1 text-xs text-[#9A91A8]">
              Confirmed by the payment webhook
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEE9F6] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8A8298]">
                Successfully added
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1ECFF] text-[#8462DD]">
                <ShieldCheck size={18} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#2B2340]">
              {money(successfulAmount)}
            </p>
            <p className="mt-1 text-xs text-[#9A91A8]">
              {pendingCount} payment{pendingCount === 1 ? "" : "s"} awaiting
              confirmation
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#EEE9F6] bg-white shadow-sm">
          <div className="border-b border-[#F0ECF6] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#2B2340]">
                  Payment history
                </h2>
                <p className="mt-1 text-xs text-[#8B8399]">
                  {filteredTopUps.length} result
                  {filteredTopUps.length === 1 ? "" : "s"}
                </p>
              </div>

              <label className="flex w-full items-center gap-2 rounded-xl border border-[#EDE7F6] bg-[#FCFBFF] px-3.5 py-3 lg:max-w-[270px]">
                <Search size={16} className="shrink-0 text-[#A198B2]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search amount, status or ID"
                  className="w-full bg-transparent text-xs text-[#382D4C] outline-none placeholder:text-[#AAA2B7]"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map((item) => {
                const active = filter === item.value;
                return (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "bg-[#8060D8] text-white shadow-md shadow-violet-200"
                        : "border border-[#EEE9F6] bg-white text-[#776D88] hover:bg-[#FAF8FF]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#FCFBFE] text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A91A8]">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Date & time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EEF7]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-[#827B91]">
                        <RefreshCw size={17} className="animate-spin" />
                        Loading your transactions...
                      </span>
                    </td>
                  </tr>
                ) : filteredTopUps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F0FF] text-[#8666DD]">
                        <Clock3 size={22} />
                      </div>
                      <p className="mt-3 text-sm font-bold text-[#413651]">
                        No transactions found
                      </p>
                      <p className="mt-1 text-xs text-[#92899F]">
                        Try another filter or add money to your wallet.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push("/wallet")}
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#7857D5]"
                      >
                        Go to My Wallet <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredTopUps.map((item) => {
                    const id = item._id ?? item.id ?? "";
                    return (
                      <tr
                        key={id || `${item.createdAt}-${item.amountPaise}`}
                        className="transition hover:bg-[#FDFCFF]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2EDFF] text-[#8261DC]">
                              <ArrowDownLeft size={18} />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-[#3B304E]">
                                Wallet top-up
                              </p>
                              <p className="mt-1 max-w-[160px] truncate text-[10px] text-[#A098B0]">
                                {id ? `ID: ${id}` : "Payment order"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#7E758F]">
                          {dateLabel(item.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-[#302645]">
                            +{money(item.amountPaise)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {id ? (
                            <button
                              type="button"
                              onClick={() => router.push(`/transactions/${id}`)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8261DC] hover:text-[#6244B8]"
                            >
                              Details <ArrowRight size={13} />
                            </button>
                          ) : (
                            <span className="text-xs text-[#A098B0]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}

export default function TransactionsPageContent() {
  return (
    <ProtectedRoute>
      <TransactionsPageInner />
    </ProtectedRoute>
  );
}
