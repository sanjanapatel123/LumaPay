
import { ArrowDownLeft, Clock3, History, XCircle } from "lucide-react";
import type { TopUp } from "@/types/wallet";
import StatusBadge from "@/components/ui/StatusBadge";

interface TransactionListProps {
  topUps: TopUp[];
  loading?: boolean;
}

function formatRupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function TransactionList({
  topUps,
  loading = false,
}: TransactionListProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6 sm:px-8">
        <div className="rounded-2xl bg-lavender-100 p-3 text-lavender-700">
          <History size={20} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">
            Recent transactions
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Your latest wallet activity
          </p>
        </div>
      </div>

      {loading && topUps.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-ink-500">
          Loading transactions...
        </div>
      ) : topUps.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="rounded-2xl bg-lavender-50 p-4 text-lavender-600">
            <History size={26} />
          </div>
          <h3 className="mt-4 font-semibold text-ink-900">
            No transactions yet
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-ink-500">
            Your top-ups will appear here after you start making payments.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {topUps.map((topUp) => {
            const isSuccess = topUp.status === "SUCCESS";
            const isFailed = topUp.status === "FAILED";
            const Icon = isSuccess
              ? ArrowDownLeft
              : isFailed
                ? XCircle
                : Clock3;

            return (
              <article
                key={topUp._id}
                className="flex flex-col gap-4 px-6 py-5 transition-colors duration-200 hover:bg-lavender-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-2xl p-3 ${
                      isSuccess
                        ? "bg-emerald-50 text-emerald-600"
                        : isFailed
                          ? "bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      Wallet top-up
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {new Date(topUp.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p
                    className={`text-sm font-bold ${
                      isSuccess ? "text-emerald-700" : "text-ink-900"
                    }`}
                  >
                    {isSuccess ? "+" : ""}
                    {formatRupees(topUp.amountPaise)}
                  </p>
                  <StatusBadge status={topUp.status} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
