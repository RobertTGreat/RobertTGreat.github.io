'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export type ModalImage = {
  src: string;
  alt: string;
};

type ImageModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  images: ModalImage[];
  index: number;
  onIndexChange: (index: number) => void;
  href?: string;
};

export default function ImageModal({
  open,
  onClose,
  title,
  description,
  images,
  index,
  onIndexChange,
  href,
}: ImageModalProps) {
  const count = images.length;
  const current = images[index] ?? images[0];

  const goPrev = useCallback(() => {
    if (count < 2) return;
    onIndexChange((index - 1 + count) % count);
  }, [count, index, onIndexChange]);

  const goNext = useCallback(() => {
    if (count < 2) return;
    onIndexChange((index + 1) % count);
  }, [count, index, onIndexChange]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative z-[1] w-full max-w-5xl flex flex-col gap-3 sm:gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-1">
          <div className="min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-semibold text-white tracking-wide truncate">
              {title}
            </h3>
            {description ? (
              <p className="text-[13px] text-white/40 font-light mt-1 line-clamp-2">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/60 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Open link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16:9 stage — contain, never stretch */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt}
            className="absolute inset-0 w-full h-full object-contain"
          />

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono text-white/45 bg-black/50 px-2.5 py-1 rounded-full border border-white/10">
                {index + 1} / {count}
              </p>
            </>
          ) : null}
        </div>

        {/* Thumbnails */}
        {count > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 px-0.5">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => onIndexChange(i)}
                className={`relative shrink-0 w-24 sm:w-28 aspect-video rounded-md overflow-hidden border transition-all cursor-pointer bg-[#0a0a0a] ${
                  i === index
                    ? 'border-white/35 ring-1 ring-white/20'
                    : 'border-white/[0.08] opacity-55 hover:opacity-90'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
