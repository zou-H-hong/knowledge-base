"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  coverUrl?: string | null;
  createdAt: string;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20" style={{ color: "var(--text-muted)" }}>加载中...</div>}>
      <PostList />
    </Suspense>
  );
}

function PostList() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    fetch(`/api/posts?${params.toString()}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setPosts)
      .catch(() => {
        fetch("/data/posts.json")
          .then((r) => r.json())
          .then((data: Post[]) => {
            const filtered = category ? data.filter((p) => p.category === category) : data;
            setPosts(filtered);
          })
          .catch(() => setPosts([]));
      })
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14">
      {/* Hero 区域 */}
      <div className="mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full"
          style={{
            background: "var(--glass-thick)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)", boxShadow: "0 0 6px rgba(13,115,119,0.5)" }} />
          <span className="text-[11px] tracking-[1px]" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
            {category || "KNOWLEDGE BASE"}
          </span>
        </div>
        <h1
          className="text-[clamp(28px,4vw,40px)] leading-tight mb-3"
          style={{ color: "var(--text)", fontFamily: "'Noto Serif SC', Georgia, serif", fontWeight: 700 }}
        >
          {category || "探索知识的边界"}
        </h1>
        <p className="text-[16px] max-w-xl" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          阅读、思考、对话 — 构建你的认知体系
        </p>
      </div>

      {/* 分割线 */}
      <div className="divider mb-10">
        <div className="divider-line" />
        <div className="divider-dot" />
        <div className="divider-line" />
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-2" style={{ color: "var(--text-muted)" }}>暂无内容</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            去 <a href="/admin" style={{ color: "var(--accent)" }}>发布页</a> 创建第一篇内容吧
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <PostCard
                id={post.id}
                title={post.title}
                content={post.content}
                type={post.type}
                coverUrl={post.coverUrl}
                createdAt={post.createdAt}
                category={post.category}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
