import Link from "next/link";
import { useState, useEffect } from "react";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  type: string;
  coverUrl?: string | null;
  coverImage?: string | null;
  createdAt: string;
}

interface TaxonomyTag { id: string; label: string; aliases: string[] }
interface TaxonomyGroup { id: string; label: string; priority: number; tags: TaxonomyTag[] }
interface Taxonomy { groups: TaxonomyGroup[] }

function sortTagsByTaxonomy(tags: string[], taxonomy: Taxonomy | null): string[] {
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

const typeLabels: Record<string, { label: string; color: string }> = {
  article: { label: "Article", color: "var(--text-muted)" },
  audio: { label: "Audio", color: "var(--accent)" },
  video: { label: "Video", color: "var(--teal)" },
  image: { label: "Image", color: "var(--accent)" },
};

interface PostCardPropsExtended extends PostCardProps {
  category?: string;
  tags?: string;
}

export default function PostCard({ id, title, content, type, coverUrl, coverImage, createdAt, category, tags }: PostCardPropsExtended) {
  const cover = coverImage || coverUrl;
  const info = typeLabels[type] || typeLabels.article;
  const date = new Date(createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  useEffect(() => { fetch("/tag-taxonomy.json").then(r => r.json()).then(setTaxonomy).catch(() => {}); }, []);
  const tagList = sortTagsByTaxonomy((tags || "").split(",").map(t => t.trim()).filter(Boolean).slice(0, 5), taxonomy);

  return (
    <Link href={`/post/${id}`}>
      <article
        className="group glass-card overflow-hidden transition-all duration-300 cursor-pointer"
        style={{ padding: 0 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
          e.currentTarget.style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {cover && (
          <div className="aspect-[3/2] overflow-hidden relative" style={{ background: "rgba(0,0,0,0.02)" }}>
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span
              className="absolute top-4 left-4 text-[11px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-md"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {info.label}
            </span>
            {category && (
              <span
                className="absolute top-4 right-4 text-[11px] px-2.5 py-1 rounded-md"
                style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {category}
              </span>
            )}
          </div>
        )}
        {!cover && (
          <div className="aspect-[3/2] flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #e8e4de 0%, #d4cfc6 100%)" }}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" style={{ opacity: 0.15 }}>
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10" />
            </svg>
            <span
              className="absolute top-4 left-4 text-[11px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-md"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {info.label}
            </span>
            {category && (
              <span
                className="absolute top-4 right-4 text-[11px] px-2.5 py-1 rounded-md"
                style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {category}
              </span>
            )}
          </div>
        )}
        <div className="p-7">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-[11px] tracking-[1.5px] uppercase"
              style={{ color: info.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
            >
              {info.label}
            </span>
            <span className="text-[11px] tracking-[1px]" style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
              {date}
            </span>
          </div>
          <h3
            className="text-[1.2rem] mb-3 line-clamp-2 leading-snug"
            style={{ color: "var(--text)", fontFamily: "'Noto Serif SC', Georgia, serif", fontWeight: 600 }}
          >
            {title}
          </h3>
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tagList.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(194,65,12,0.06)",
                    color: "var(--accent)",
                    border: "1px solid rgba(194,65,12,0.15)",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.3px",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p
            className="text-[15px] leading-[1.85] line-clamp-3"
            style={{ color: "var(--text-secondary)", fontWeight: 400 }}
          >
            {content.replace(/[#*`>\[\]()]/g, "").slice(0, 160)}
          </p>
        </div>
      </article>
    </Link>
  );
}
