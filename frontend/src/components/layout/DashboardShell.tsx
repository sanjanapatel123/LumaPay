"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8FF]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen transition-[margin] duration-300 lg:ml-[264px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-8 sm:py-9">
          <div className="animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
