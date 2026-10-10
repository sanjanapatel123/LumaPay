"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wallet_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8FF]">
        <div className="flex items-center gap-3 text-sm font-medium text-lavender-700">
          <LoaderCircle className="animate-spin" size={20} />
          Verifying your session...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
