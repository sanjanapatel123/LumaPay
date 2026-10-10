import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WalletDashboard from "@/components/wallet/WalletDashboard";

export const metadata: Metadata = {
  title: "LumaPay | Overview",
  description: "Manage your wallet and transactions.",
};

export default function HomePage() {
  return (
    <ProtectedRoute>
      <WalletDashboard />
    </ProtectedRoute>
  );
}
