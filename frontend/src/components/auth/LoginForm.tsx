"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
  Wallet,
} from "lucide-react";
import { apiRequest, unwrapResponse } from "@/lib/api";
import type { LoginResponse } from "@/types/wallet";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Login failed");
      }

      if (!result?.token) {
        throw new Error("Login token was not returned");
      }
      localStorage.setItem("wallet_token", result.token);

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8FF] p-5">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white bg-white shadow-premium md:grid-cols-2">
        <section className="relative hidden min-h-[580px] overflow-hidden bg-gradient-to-br from-lavender-700 via-lavender-600 to-[#B6A3F6] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/20" />
          <div className="absolute -right-8 top-32 h-44 w-44 rounded-full border border-white/20" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
              <Wallet size={25} />
            </div>
            <span className="font-display text-xl font-extrabold">LumaPay</span>
          </div>

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm">
              <Sparkles size={15} />
              Your money, beautifully managed
            </div>

            <h1 className="max-w-sm font-display text-4xl font-bold leading-tight">
              A little more clarity. A lot more control.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/80">
              One simple space to manage your wallet, add money, and keep track
              of every transaction.
            </p>
          </div>

          <p className="relative text-xs text-white/70">
            A simpler way to manage your money.
          </p>
        </section>

        <section className="flex min-h-[580px] flex-col justify-center p-7 sm:p-12">
          <div className="mb-9 flex items-center gap-3 md:hidden">
            <div className="rounded-xl bg-lavender-100 p-3 text-lavender-700">
              <Wallet size={23} />
            </div>
            <span className="font-display text-xl font-extrabold text-ink-900">
              LumaPay
            </span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.16em] text-lavender-700">
              WELCOME BACK
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900">
              Sign in to your wallet
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-700">
                Email address
              </span>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-lavender-400 focus:bg-white focus:ring-4 focus:ring-lavender-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-700">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-lavender-400 focus:bg-white focus:ring-4 focus:ring-lavender-100"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lavender-800 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-lavender-200 transition duration-200 hover:-translate-y-0.5 hover:bg-lavender-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <LockKeyhole size={17} />
              )}
              {loading ? "Signing in..." : "Sign in securely"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
