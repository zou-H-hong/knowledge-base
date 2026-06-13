"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* 顶部栏 — 毛玻璃 */}
      <header
        className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-6 lg:px-10"
        style={{
          background: "rgba(245,244,239,0.8)",
          backdropFilter: "blur(16px) saturate(1.1)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg lg:hidden transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
          <span
            className="text-lg tracking-[0.25em]"
            style={{ color: "var(--text)", fontFamily: "'Noto Serif SC', Georgia, serif", fontWeight: 400 }}
          >
            大刘读书
          </span>
        </Link>

        <div className="w-8 lg:hidden" />
      </header>

      <Suspense fallback={null}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      {/* 主内容区 */}
      <main className="pt-14 lg:pl-[240px] min-h-screen relative z-1">
        {children}
      </main>
    </div>
  );
}
