"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Plus, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";

interface AddMoneyCardProps {
  onSubmit: (amountPaise: number) => Promise<void>;
  loading?: boolean;
}

const quickAmounts = [500, 1000, 2000];

export default function AddMoneyCard({
  onSubmit,
  loading = false,
}: AddMoneyCardProps) {
  const [amount, setAmount] = useState("1000");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const rupees = Number(amount);
    const paise = Math.round(rupees * 100);

    if (
      !Number.isFinite(rupees) ||
      !Number.isSafeInteger(paise) ||
      paise < 10000 ||
      paise > 5000000
    ) {
      setError("Enter an amount between ₹100 and ₹50,000.");
      return;
    }

    try {
      await onSubmit(paise);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
    }
  }

  return (
    <section className="rounded-[28px] border border-white bg-white p-6 shadow-card sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">
            Add money
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Top up your wallet securely
          </p>
        </div>

        <div className="rounded-2xl bg-lavender-100 p-3 text-lavender-700">
          <Plus size={21} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="topup-amount"
          className="mb-2 block text-xs font-semibold tracking-wide text-ink-500"
        >
          AMOUNT IN RUPEES
        </label>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-lavender-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-lavender-100">
          <span className="text-lg font-semibold text-ink-500">₹</span>
          <input
            id="topup-amount"
            type="number"
            min="100"
            max="50000"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1000"
            className="w-full bg-transparent py-4 text-xl font-bold text-ink-900 outline-none"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {quickAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(value))}
              className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                Number(amount) === value
                  ? "border-lavender-300 bg-lavender-50 text-lavender-700"
                  : "border-slate-200 text-ink-500 hover:border-lavender-200 hover:bg-lavender-50"
              }`}
            >
              ₹{value.toLocaleString("en-IN")}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-ink-500">
          Minimum ₹100 · Maximum ₹50,000
        </p>

        {error && (
          <p role="alert" className="mt-3 text-xs text-rose-600">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="mt-5 w-full py-4">
          Continue to payment
          {!loading && <ArrowRight size={17} />}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-500">
          <ShieldCheck size={14} />
          Protected payment flow
        </p>
      </form>
    </section>
  );
}
