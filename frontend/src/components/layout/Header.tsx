"use client";

import { Bell, Menu, ShieldCheck, UserRound } from "lucide-react";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#F0ECF8] bg-[#FAF8FF]/90 backdrop-blur-xl">
      <div className="flex min-h-[84px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-[#EEE8FA] bg-white p-2.5 text-ink-700 transition hover:border-lavender-200 hover:bg-lavender-50 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-xs font-medium text-ink-500">
              Wallet / Overview
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-ink-900 sm:text-xl">
              Dashboard
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure workspace
          </div>

          <button
            aria-label="Notifications"
            className="relative rounded-xl border border-[#EEE8FA] bg-white p-2.5 text-ink-500 transition hover:bg-lavender-50 hover:text-lavender-700"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lavender-500" />
          </button>

          <div className="hidden h-8 w-px bg-[#EEE8FA] sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink-900">My Account</p>
              <p className="mt-0.5 text-[11px] text-ink-500">Wallet user</p>
            </div>
            <div className="rounded-xl bg-lavender-100 p-2.5 text-lavender-700">
              <UserRound size={19} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 pb-3 text-[11px] text-ink-500 sm:px-8">
        <ShieldCheck size={13} className="text-emerald-600" />
        Your wallet activity is protected by authenticated API access.
      </div>
    </header>
  );
}
