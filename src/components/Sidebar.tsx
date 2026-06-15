"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const categories = [
  { key: "", label: "全部", icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" },
  { key: "大刘认知课", label: "大刘认知课", icon: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
  { key: "大刘三人行", label: "大刘三人行", icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
  { key: "大佬对谈", label: "大佬对谈", icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
  { key: "好书细讲", label: "好书细讲", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
  { key: "大刘读书会", label: "大刘读书会", icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const isHome = pathname === "/";

  return (
    <>
      {/* 遮罩层 */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity"
          style={{ background: "rgba(0,0,0,0.12)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* 侧边栏 — 毛玻璃风格 */}
      <aside
        className={`fixed top-14 left-0 z-50 h-[calc(100vh-56px)] w-[240px] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(237,234,227,0.7)",
          backdropFilter: "blur(20px) saturate(1.1)",
          borderRight: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* 品牌标识 */}
        <div className="px-6 pt-8 pb-2">
          <p
            className="text-[11px] tracking-[3px] uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            DALIU READING
          </p>
        </div>

        {/* 分类导航 */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = isHome && currentCategory === cat.key;
              const href = cat.key ? `/?category=${encodeURIComponent(cat.key)}` : "/";
              return (
                <Link
                  key={cat.key}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3.5 px-4 py-3 text-[15px] rounded-xl transition-all duration-200"
                  style={isActive ? {
                    background: "var(--glass-thick)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                    boxShadow: "var(--shadow-xs)",
                    color: "var(--text)",
                    fontWeight: 600,
                  } : {
                    color: "var(--text-secondary)",
                    fontWeight: 400,
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.4)";
                      e.currentTarget.style.color = "var(--text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                  </svg>
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 底部 */}
        <div className="px-6 py-5 border-t shrink-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
          <p className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
            &copy; 2026 大刘读书
          </p>
        </div>
      </aside>
    </>
  );
}
