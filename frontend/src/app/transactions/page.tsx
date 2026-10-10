import type { Metadata } from "next";
import TransactionsPageContent from "@/components/wallet/TransactionsPageContent";

export const metadata: Metadata = {
  title: "Transactions | LumaPay",
  description: "Review wallet top-ups and payment statuses.",
};

export default function TransactionsPage() {
  return <TransactionsPageContent />;
}
