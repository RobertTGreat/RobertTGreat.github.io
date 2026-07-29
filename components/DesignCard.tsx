'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ExternalLink, Expand } from 'lucide-react';
import type { DesignPiece } from '@/data/design-work';
import ImageModal, { type ModalImage } from '@/components/ImageModal';

type DesignCardProps = DesignPiece & {
  delay?: number;
};

export default function DesignCard({
  title,
  description,
  image,
  images,
  href,
  tags,
  variant = 'default',
  delay = 0,
}: DesignCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const isProfile = variant === 'profile';
  const gallery: ModalImage[] | null =
    images && images.length > 0 ? images : null;
  const single: ModalImage[] | null =
    !gallery && image ? [{ src: image, alt: title }] : null;
  const slides = gallery ?? single;
  const cover = slides?.[active]?.src ?? image;

  const openModal = (index = active) => {
    if (isProfile) return;
    if (!slides || slides.length === 0) return;
    setModalIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 36 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        className="group relative h-full"
      >
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/[0.07] via-transparent to-white/[0.03] opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative h-full rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] overflow-hidden backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.14] flex flex-col">
          {/* Fixed 16:9 (profile keeps square) — object-contain = no stretch */}
          <div
            className={`relative bg-[#060606] overflow-hidden border-b border-white/[0.06] ${
              isProfile ? 'aspect-square' : 'aspect-video'
            }`}
          >
            <div
              className={`absolute inset-0 pointer-events-none z-[1] ${
                isProfile
                  ? 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(127,0,255,0.08),transparent_55%)]'
                  : 'bg-[radial-gradient(ellipse_at_50%_30%,rgba(127,0,255,0.06),transparent_55%)]'
              }`}
            />

            {slides && slides.length > 0 ? (
              slides.map((shot, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  className={`absolute inset-0 w-full h-full transition-all duration-700 ${
                    isProfile
                      ? 'object-cover object-center group-hover:scale-[1.03]'
                      : 'object-contain object-center'
                  } ${i === active ? 'opacity-100' : 'opacity-0'}`}
                />
              ))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-4xl font-semibold text-white/10 tracking-widest">
                  {title.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}

            {/* Click target for modal (designs only) */}
            {!isProfile && slides && slides.length > 0 ? (
              <button
                type="button"
                onClick={() => openModal(active)}
                className="absolute inset-0 z-[2] cursor-zoom-in"
                aria-label={`View ${title} fullscreen`}
              />
            ) : null}

            {!isProfile && cover ? (
              <div className="absolute top-2.5 right-2.5 z-[3] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-white/70 bg-black/55 border border-white/10 backdrop-blur-sm">
                  <Expand className="w-3 h-3" />
                  View
                </span>
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-[1]" />

            {gallery && gallery.length > 1 ? (
              <div className="absolute inset-x-0 bottom-0 z-[4] p-2.5 sm:p-3 flex gap-1.5">
                {gallery.map((shot, i) => (
                  <button
                    key={shot.src}
                    type="button"
                    onClick={() => setActive(i)}
                    onDoubleClick={() => openModal(i)}
                    aria-label={`Show ${title} image ${i + 1}`}
                    className={`relative flex-1 aspect-video rounded-md overflow-hidden border transition-all duration-300 cursor-pointer bg-black/40 ${
                      i === active
                        ? 'border-white/30 ring-1 ring-white/20'
                        : 'border-white/[0.08] opacity-60 hover:opacity-90'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {isProfile && href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-[3]"
                aria-label={`${title} on ArtStation`}
              />
            ) : null}
          </div>

          <div className="p-5 flex flex-col gap-2 flex-1">
            <div className="flex items-start justify-between gap-2">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={`font-display font-semibold text-white tracking-wide hover:text-white/90 transition-colors ${
                    isProfile ? 'text-xl' : 'text-lg'
                  }`}
                >
                  {title}
                </a>
              ) : (
                <h3
                  className={`font-display font-semibold text-white tracking-wide ${
                    isProfile ? 'text-xl' : 'text-lg'
                  }`}
                >
                  {title}
                </h3>
              )}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 mt-1"
                  aria-label={`Open ${title}`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition-colors" />
                </a>
              ) : null}
            </div>
            {description ? (
              <p className="text-[13px] text-white/40 leading-relaxed font-light">
                {description}
              </p>
            ) : null}
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-mono text-white/30 border border-white/[0.06] rounded-md bg-white/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {slides && slides.length > 0 && !isProfile ? (
        <ImageModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={title}
          description={description}
          images={slides}
          index={modalIndex}
          onIndexChange={setModalIndex}
          href={href}
        />
      ) : null}
    </>
  );
}
