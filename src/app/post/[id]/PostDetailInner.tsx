"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import MediaPlayer from "@/components/MediaPlayer";
import ImageViewer from "@/components/ImageViewer";
import TableOfContents from "@/components/TableOfContents";

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
  coverUrl?: string | null;
  createdAt: string;
  media: Media[];
}

interface PostDetailInnerProps {
  postId: string;
  initialPost: Post;
}

export default function PostDetailInner({ postId, initialPost }: PostDetailInnerProps) {
  const post = initialPost;
  const imageVideos = post.media.filter((m) => m.fileType === "image" || m.fileType === "video");
  const audios = post.media.filter((m) => m.fileType === "audio");

  return (
    <>
    <TableOfContents content={post.content} />
    <div className="post-detail max-w-[1400px] px-6 lg:pl-8 lg:pr-16 pt-8 pb-20" style={{ marginLeft: "3%", marginRight: "auto" }}>
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
            {new Date(post.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* 分割线 */}
        <div className="divider">
          <div className="divider-line" />
          <div className="divider-dot" />
          <div className="divider-line" />
        </div>
      </div>

      {/* 双栏：左固定 + 右滚动 */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* 左栏：图片和视频 — sticky */}
        <div className="lg:w-[38%] lg:sticky lg:top-20 lg:self-start min-w-0">
          <div
            className="glass-card media-block p-6 animate-section"
            tabIndex={-1}
          >
            {post.coverUrl && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <ImageViewer src={post.coverUrl} alt={post.title} className="w-full" />
              </div>
            )}
            {imageVideos.length > 0 ? (
              <div className="space-y-5">
                {imageVideos.map((m) => (
                  <MediaPlayer key={m.id} url={m.url} fileType={m.fileType} fileName={m.fileName} />
                ))}
              </div>
            ) : !post.coverUrl ? (
              <div className="flex items-center justify-center h-48 text-[14px]" style={{ color: "var(--text-muted)" }}>
                暂无图片 / 视频
              </div>
            ) : null}
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
          <div className="glass-card p-8 lg:p-10 mb-8 animate-section" tabIndex={-1}>
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
