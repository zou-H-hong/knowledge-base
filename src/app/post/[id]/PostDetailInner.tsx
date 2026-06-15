"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import MediaPlayer from "@/components/MediaPlayer";
import ImageViewer from "@/components/ImageViewer";
import TableOfContents from "@/components/TableOfContents";

function sortTagsByTaxonomy(tags: string[], taxonomy: any): string[] {
  if (!taxonomy) return tags;
  return tags.sort((a, b) => {
    let pa = { priority: 999, tagOrder: 0 };
    let pb = { priority: 999, tagOrder: 0 };
    for (const group of taxonomy.groups) {
      for (let i = 0; i < group.tags.length; i++) {
        const t = group.tags[i];
        if (t.label === a || t.aliases.includes(a)) pa = { priority: group.priority, tagOrder: i };
        if (t.label === b || t.aliases.includes(b)) pb = { priority: group.priority, tagOrder: i };
      }
    }
    return pa.priority - pb.priority || pa.tagOrder - pb.tagOrder;
  });
}

/** Extract plain text from ReactMarkdown children */
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as React.ReactElement).props.children);
  }
  return "";
}

/** Generate a URL-safe ID from heading text */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const markdownComponents: Components = {
  h2: ({ children, ...props }) => {
    const id = headingId(extractText(children));
    return <h2 id={id} {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }) => {
    const id = headingId(extractText(children));
    return <h3 id={id} {...props}>{children}</h3>;
  },
};

interface Media {
  id: string;
  url: string;
  fileType: string;
  fileName: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  category?: string;
  tags?: string;
  coverUrl?: string | null;
  coverImage?: string | null;
  images?: string;
  createdAt: string;
  media: Media[];
}

interface PostDetailInnerProps {
  postId: string;
  initialPost: Post;
}

export default function PostDetailInner({ postId, initialPost }: PostDetailInnerProps) {
  const post = initialPost;
  const cover = post.coverImage || post.coverUrl;
  const [taxonomy, setTaxonomy] = useState<any>(null);
  useEffect(() => { fetch("/tag-taxonomy.json").then(r => r.json()).then(setTaxonomy).catch(() => {}); }, []);
  const rawTags = (post.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  const postTags = taxonomy ? sortTagsByTaxonomy(rawTags, taxonomy) : rawTags.sort();
  const imageVideos = post.media.filter((m) => m.fileType === "image" || m.fileType === "video");
  const audios = post.media.filter((m) => m.fileType === "audio");
  // Parse images field (comma-separated URLs)
  const extraImages = (post.images || "").split(",").map(s => s.trim()).filter(Boolean);
  // Merge: cover + extraImages + media images (deduplicate)
  const allImageUrls: string[] = [];
  if (cover) allImageUrls.push(cover);
  for (const url of extraImages) {
    if (!allImageUrls.includes(url)) allImageUrls.push(url);
  }
  for (const m of imageVideos) {
    if (m.fileType === "image" && !allImageUrls.includes(m.url)) allImageUrls.push(m.url);
  }
  const videoMedia = imageVideos.filter(m => m.fileType === "video");

  return (
    <>
    <TableOfContents content={post.content} />
    <div className="post-detail max-w-[1400px] px-3 sm:px-6 lg:pl-8 lg:pr-16 pt-8 pb-20" style={{ marginLeft: "auto", marginRight: "auto" }}>
      {/* 顶部：品牌 + 返回 */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-[12px] tracking-[1.5px] uppercase transition-colors"
            style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            &larr; 返回首页
          </Link>
        </div>

        {/* Hero 标题区 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
            style={{
              background: "var(--glass-thick)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)", boxShadow: "0 0 6px rgba(13,115,119,0.5)" }} />
            <span className="text-[11px] tracking-[1px]" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
              {post.category || post.type}
            </span>
          </div>
          <h1
            className="text-[clamp(32px,5vw,48px)] leading-[1.2] mb-5"
            style={{ color: "var(--text)", fontFamily: "'Noto Serif SC', Georgia, serif", fontWeight: 700 }}
          >
            {post.title}
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" }}>
            {new Date(post.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}
          </p>
          {postTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {postTags.map(tag => (
                <Link
                  key={tag}
                  href={`/?tag=${tag}`}
                  className="text-[11px] px-2 py-0.5 rounded transition-colors"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: "transparent",
                    color: "#aaa",
                    border: "1px solid rgba(0,0,0,0.06)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)"; }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 分割线 */}
        <div className="divider">
          <div className="divider-line" />
          <div className="divider-dot" />
          <div className="divider-line" />
        </div>
      </div>

      {/* 移动端：单栏，桌面端：双栏 */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-14">
        {/* 左栏：图片和视频 — 独立滚动 */}
        <div className="lg:w-[38%] min-w-0 lg:sticky lg:top-16 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#ccc transparent" }}>
          <div
            className="glass-card media-block p-3 sm:p-6 animate-section"
            tabIndex={-1}
          >
            {allImageUrls.length > 0 ? (
              <div className="space-y-5">
                {/* 移动端只展示第一张，桌面端全部 */}
                {allImageUrls.slice(0, 1).map((url, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden lg:hidden">
                    <ImageViewer src={url} alt={`${post.title} - ${idx + 1}`} className="w-full" />
                  </div>
                ))}
                {allImageUrls.map((url, idx) => (
                  <div key={`desktop-${idx}`} className="rounded-xl overflow-hidden hidden lg:block">
                    <ImageViewer src={url} alt={`${post.title} - ${idx + 1}`} className="w-full" />
                  </div>
                ))}
              </div>
            ) : videoMedia.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-[14px]" style={{ color: "var(--text-muted)" }}>
                暂无图片 / 视频
              </div>
            ) : null}
            {videoMedia.length > 0 && (
              <div className="space-y-5 mt-5">
                {videoMedia.map((m) => (
                  <MediaPlayer key={m.id} url={m.url} fileType={m.fileType} fileName={m.fileName} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右栏：文稿和音频 */}
        <div className="lg:w-[62%] min-w-0">
          {/* 音频 */}
          {audios.length > 0 && (
            <div className="mb-10 space-y-4">
              {audios.map((m) => (
                <MediaPlayer key={m.id} url={m.url} fileType={m.fileType} fileName={m.fileName} />
              ))}
            </div>
          )}

          {/* 文章内容 — 毛玻璃卡片包裹 */}
          <div className="glass-card p-4 sm:p-8 lg:p-10 mb-8 animate-section" tabIndex={-1}>
            <article className="prose max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
            </article>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
