"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("wallet_token")) {
      router.replace("/");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8FF]">
        <p className="text-sm text-lavender-700">Loading...</p>
      </main>
    );
  }

  return <LoginForm />;
}
