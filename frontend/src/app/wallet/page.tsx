import type { Metadata } from "next";
import WalletPageContent from "@/components/wallet/WalletPageContent";

export const metadata: Metadata = {
  title: "My Wallet | LumaPay",
  description: "View your wallet balance and add money securely.",
};

export default function WalletPage() {
  return <WalletPageContent />;
}
