"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ImageViewer({ src, alt = "", className = "" }: ImageViewerProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const openViewer = () => {
    reset();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(10, Math.max(0.2, s - e.deltaY * 0.002)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: offsetStart.current.x + (e.clientX - dragStart.current.x),
      y: offsetStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handlePointerUp = () => setDragging(false);

  const viewer = open ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setScale((s) => Math.min(10, s * 1.5))}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center"
          title="放大"
        >+</button>
        <button
          onClick={() => setScale((s) => Math.max(0.2, s / 1.5))}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center"
          title="缩小"
        >-</button>
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm flex items-center justify-center"
          title="重置"
        >1:1</button>
        <button
          onClick={() => setOpen(false)}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center"
          title="关闭"
        >×</button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none">
        {scale > 1 ? "拖拽平移 · 滚轮缩放" : "滚轮放大 · 点击空白关闭"} · {Math.round(scale * 100)}%
      </div>

      <img
        src={src}
        alt={alt}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        draggable={false}
        className="max-w-[95vw] max-h-[95vh] object-contain select-none"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
          transition: dragging ? "none" : "transform 0.1s ease-out",
        }}
      />
    </div>
  ) : null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={openViewer}
        className={`cursor-zoom-in ${className}`}
      />
      {typeof document !== "undefined" && viewer && createPortal(viewer, document.body)}
    </>
  );
}
