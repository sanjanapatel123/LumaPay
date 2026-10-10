import { ArrowDownLeft, History } from "lucide-react";
import type { TopUp } from "@/types/wallet";

interface WalletStatsProps {
  topUps: TopUp[];
}

function formatRupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function WalletStats({ topUps }: WalletStatsProps) {
  const successfulTopUps = topUps.filter((topUp) => topUp.status === "SUCCESS");

  const totalAdded = successfulTopUps.reduce(
    (total, topUp) => total + topUp.amountPaise,
    0,
  );

  const stats = [
    {
      title: "Total money added",
      value: formatRupees(totalAdded),
      subtitle: `${successfulTopUps.length} successful top-ups`,
      icon: ArrowDownLeft,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Transactions",
      value: String(topUps.length),
      subtitle: "Total top-up attempts",
      icon: History,
      iconStyle: "bg-lavender-100 text-lavender-700",
    },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2">
      {stats.map(({ title, value, subtitle, icon: Icon, iconStyle }) => (
        <article
          key={title}
          className="rounded-3xl border border-white bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-premium"
        >
          <div className="flex items-center justify-between">
            <div className={`rounded-2xl p-3 ${iconStyle}`}>
              <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-ink-500">{title}</span>
          </div>

          <p className="mt-5 font-display text-2xl font-extrabold text-ink-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
        </article>
      ))}
    </section>
  );
}
