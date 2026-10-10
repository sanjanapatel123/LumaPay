
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { PaymentStatus } from "@/types/wallet";

const statusConfig = {
  SUCCESS: {
    label: "Success",
    className: "bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700",
    Icon: Clock3,
  },
  FAILED: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700",
    Icon: XCircle,
  },
};

export default function StatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const { label, className, Icon } = statusConfig[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}
