'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import type { ConceptPaper } from '@/data/concept-papers';

type ConceptPaperCardProps = ConceptPaper & {
  delay?: number;
  onRead: (paper: ConceptPaper) => void;
};

export default function ConceptPaperCard(props: ConceptPaperCardProps) {
  const {
    title,
    subtitle,
    description,
    tags,
    readTime,
    date,
    type = 'paper',
    delay = 0,
    onRead,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const isPaper = type === 'paper';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full w-full"
    >
      <div
        className={`absolute -inset-px rounded-2xl opacity-60 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 ${
          isPaper
            ? 'bg-gradient-to-br from-white/15 via-transparent to-white/5'
            : 'bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03]'
        }`}
      />

      <div
        className={`relative h-full rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between gap-5 overflow-hidden ${
          isPaper
            ? 'bg-[#060606]/95 border border-dashed border-white/20 group-hover:border-white/40'
            : 'bg-[#0a0a0a]/95 border border-white/[0.07] group-hover:border-white/[0.14]'
        }`}
      >
        {/* Dotted Blueprint Grid Background Effect for Papers */}
        {isPaper ? (
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity" />
        ) : null}

        <div className="relative z-10">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded-full uppercase tracking-widest ${
                  isPaper
                    ? 'text-white/80 bg-white/10 border border-dashed border-white/25'
                    : 'text-white/50 bg-white/[0.04] border border-white/[0.08]'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                {isPaper ? 'Technical Paper' : 'Blog'}
              </span>
              {readTime ? (
                <span className="text-[11px] font-mono text-white/40">
                  • {readTime}
                </span>
              ) : null}
            </div>
            {date ? (
              <span className="text-[11px] font-mono text-white/30">
                {date}
              </span>
            ) : null}
          </div>

          {/* Title & Subtitle */}
          <h3
            className={`font-display text-xl sm:text-2xl font-semibold tracking-wide mb-1.5 transition-colors ${
              isPaper
                ? 'text-white group-hover:text-white/90 font-mono tracking-normal'
                : 'text-white group-hover:text-white/90'
            }`}
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="text-xs font-mono text-white/50 mb-3">
              {subtitle}
            </p>
          ) : null}

          {/* Abstract Description */}
          <p className="text-xs sm:text-sm text-white/45 font-light leading-relaxed mb-5">
            {description}
          </p>

          {/* Topic Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-md ${
                  isPaper
                    ? 'text-white/45 border border-dashed border-white/15 bg-white/[0.03]'
                    : 'text-white/35 border border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => onRead(props)}
            className="white-shine-btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white/85 hover:text-white transition-colors cursor-pointer"
          >
            Read Paper
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
