"use client";
import { useState, useEffect, useRef } from "react";

interface TaxonomyTag { id: string; label: string; aliases: string[] }
interface TaxonomyGroup { id: string; label: string; priority: number; tags: TaxonomyTag[] }
interface Taxonomy { groups: TaxonomyGroup[] }

interface TagPickerProps {
  value: string; // 逗号分隔的标签
  onChange: (tags: string) => void;
}

export default function TagPicker({ value, onChange }: TagPickerProps) {
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const tags = value.split(",").map(t => t.trim()).filter(Boolean);

  useEffect(() => {
    fetch("/tag-taxonomy.json").then(r => r.json()).then(setTaxonomy).catch(() => {});
  }, []);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    onChange([...tags, t].join(","));
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag).join(","));
  };

  const moveTag = (from: number, to: number) => {
    if (from === to) return;
    const arr = [...tags];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr.join(","));
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIndex !== null) moveTag(dragIndex, idx);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      {/* 已选标签 — 可拖拽排序 */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px", minHeight: "32px" }}>
          {tags.map((tag, idx) => (
            <span
              key={tag}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                padding: "4px 8px 4px 10px",
                borderRadius: "12px",
                background: dragOverIndex === idx ? "rgba(194,65,12,0.15)" : "rgba(194,65,12,0.08)",
                color: "#c2410c",
                border: `1px solid ${dragOverIndex === idx ? "#c2410c" : "rgba(194,65,12,0.2)"}`,
                cursor: "grab",
                userSelect: "none",
                transition: "all 0.15s",
                opacity: dragIndex === idx ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: "10px", color: "rgba(194,65,12,0.4)", marginRight: "2px" }}>⠿</span>
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                style={{
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "rgba(194,65,12,0.15)", border: "none",
                  color: "#c2410c", fontSize: "10px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1, padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 分组标签选择 */}
      {taxonomy && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
          {taxonomy.groups.map((group) => (
            <div key={group.id}>
              <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px" }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {group.tags.map((tag) => {
                  const selected = tags.includes(tag.label);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => selected ? removeTag(tag.label) : addTag(tag.label)}
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        border: `1px solid ${selected ? "#c2410c" : "#e5e7eb"}`,
                        background: selected ? "rgba(194,65,12,0.08)" : "#fff",
                        color: selected ? "#c2410c" : "#6b7280",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 自定义标签输入 */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="输入自定义标签，回车添加"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              const parts = customInput.split(",").map(t => t.trim()).filter(Boolean);
              parts.forEach(addTag);
              setCustomInput("");
            }
          }}
          style={{ flex: 1, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none" }}
        />
        {customInput && (
          <button
            type="button"
            onClick={() => {
              const parts = customInput.split(",").map(t => t.trim()).filter(Boolean);
              parts.forEach(addTag);
              setCustomInput("");
            }}
            style={{ padding: "6px 12px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
          >
            添加
          </button>
        )}
      </div>
    </div>
  );
}
