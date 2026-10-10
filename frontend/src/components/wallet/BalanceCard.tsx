import { ArrowUpRight, ShieldCheck, Wallet } from "lucide-react";

interface BalanceCardProps {
  balancePaise: number;
  loading?: boolean;
}

export default function BalanceCard({
  balancePaise,
  loading = false,
}: BalanceCardProps) {
  const balance = (balancePaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-lavender-700 via-lavender-600 to-[#A58CF0] p-7 text-white shadow-premium transition duration-300 hover:shadow-xl sm:p-9">
      <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border border-white/15" />
      <div className="pointer-events-none absolute -right-2 top-12 -z-10 h-40 w-40 rounded-full border border-white/15" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Wallet size={18} />
          Available balance
        </div>
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
          INR · ₹
        </span>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="h-12 w-48 animate-pulse rounded-xl bg-white/20" />
        ) : (
          <p className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {balance}
          </p>
        )}

        <p className="mt-3 text-sm text-white/75">
          Your money, all in one place.
        </p>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-white/20 pt-5">
        <span className="flex items-center gap-2 text-xs text-white/80">
          <ShieldCheck size={16} />
          Secure wallet
        </span>
        <span className="flex items-center gap-1 text-xs text-white/80">
          Live balance sync
          <ArrowUpRight size={15} />
        </span>
      </div>
    </section>
  );
}
