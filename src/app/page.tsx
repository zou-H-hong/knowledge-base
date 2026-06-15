"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/PostCard";

interface TaxonomyTag { id: string; label: string; aliases: string[] }
interface TaxonomyGroup { id: string; label: string; priority: number; tags: TaxonomyTag[] }
interface Taxonomy { groups: TaxonomyGroup[] }

function sortTagsByTaxonomy(tags: string[], taxonomy: Taxonomy | null): string[] {
  if (!taxonomy) return tags.sort();
  return tags.sort((a, b) => {
    const pa = getTagPriority(a, taxonomy);
    const pb = getTagPriority(b, taxonomy);
    return pa.priority - pb.priority || pa.tagOrder - pb.tagOrder;
  });
}

function getTagPriority(tag: string, taxonomy: Taxonomy): { priority: number; tagOrder: number } {
  for (const group of taxonomy.groups) {
    for (let i = 0; i < group.tags.length; i++) {
      const t = group.tags[i];
      if (t.label === tag || t.aliases.includes(tag)) {
        return { priority: group.priority, tagOrder: i };
      }
    }
  }
  return { priority: 999, tagOrder: 0 };
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  tags?: string;
  coverUrl?: string | null;
  coverImage?: string | null;
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
  const [selectedTag, setSelectedTag] = useState("");
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);

  // 加载标签体系
  useEffect(() => {
    fetch("/tag-taxonomy.json")
      .then(r => r.json())
      .then(setTaxonomy)
      .catch(() => {});
  }, []);

  // 收集所有标签，按体系排序
  const allTags = sortTagsByTaxonomy(
    Array.from(new Set(
      posts.flatMap(p => (p.tags || "").split(",").map(t => t.trim()).filter(Boolean))
    )),
    taxonomy
  );

  // 按标签筛选
  const displayPosts = selectedTag
    ? posts.filter(p => (p.tags || "").split(",").map(t => t.trim()).includes(selectedTag))
    : posts;

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
        <h1
          className="text-[clamp(28px,4vw,40px)] leading-tight mb-3"
          style={{ color: "var(--text)", fontFamily: "'Noto Serif SC', Georgia, serif", fontWeight: 700 }}
        >
          {category || "探索知识的边界"}
        </h1>
        <p className="text-[16px] max-w-xl mb-6" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          阅读、思考、对话 — 构建你的认知体系
        </p>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedTag("")}
              className="text-[12px] tracking-[0.5px] px-3.5 py-1.5 rounded-md transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: !selectedTag ? "var(--text)" : "var(--glass-thick)",
                color: !selectedTag ? "#fff" : "var(--text-secondary)",
                border: "1px solid " + (!selectedTag ? "var(--text)" : "var(--glass-border)"),
                cursor: "pointer",
              }}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                className="text-[12px] tracking-[0.5px] px-3.5 py-1.5 rounded-md transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: selectedTag === tag ? "var(--text)" : "var(--glass-thick)",
                  color: selectedTag === tag ? "#fff" : "var(--text-secondary)",
                  border: "1px solid " + (selectedTag === tag ? "var(--text)" : "var(--glass-border)"),
                  cursor: "pointer",
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
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
          {displayPosts.map((post, i) => (
            <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <PostCard
                id={post.id}
                title={post.title}
                content={post.content}
                type={post.type}
                coverUrl={post.coverUrl}
                coverImage={post.coverImage}
                createdAt={post.createdAt}
                category={post.category}
                tags={post.tags}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
