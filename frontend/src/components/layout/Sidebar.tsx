"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Settings,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "My Wallet", href: "/wallet", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
];

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-[#EEE9F8] bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-[#F1EDF8] px-6">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A58AF5] to-[#7858D8] text-white shadow-md shadow-violet-200">
              <Wallet size={21} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[19px] font-bold tracking-tight text-[#211A35]">
                LumaPay
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9B91B1]">
                Wallet workspace
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A49BB6]">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-semibold transition-colors duration-150 ${
                    active
                      ? "bg-[#F1ECFF] text-[#7656D5]"
                      : "text-[#777187] hover:bg-[#FAF8FF] hover:text-[#49377F]"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={
                      active
                        ? "text-[#805FE0]"
                        : "text-[#A29AAF] group-hover:text-[#805FE0]"
                    }
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8D6DE8]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-[#EDE6FF] bg-gradient-to-br from-[#FAF8FF] to-[#F3EEFF] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#8666DD] shadow-sm">
              <ShieldCheck size={19} />
            </div>
            <p className="text-sm font-bold text-[#352751]">Secure by design</p>
            <p className="mt-1.5 text-xs leading-5 text-[#827694]">
              Your wallet activity is protected with authenticated requests.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7B60C7]">
              <Sparkles size={12} />
              Secure workspace
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] text-[#AAA2B7]">
            LumaPay · Wallet Top-Up
          </p>
        </div>
      </aside>
    </>
  );
}
