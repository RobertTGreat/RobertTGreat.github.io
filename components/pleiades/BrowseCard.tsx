'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Download, ExternalLink } from 'lucide-react';

const SOURCE_URL = 'https://github.com/pleiades-org/Browse';
const DOWNLOAD_URL =
  'https://github.com/pleiades-org/Browse/releases/download/v0.1.2/Browse-setup.exe';
const VERSION = 'v0.1.2';

export default function BrowseCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full lg:row-span-2"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/[0.07] via-transparent to-white/[0.03] opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative h-full min-h-[420px] lg:min-h-0 rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] overflow-hidden backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.14] flex flex-col">
        <div className="relative flex-1 min-h-[200px] border-b border-white/[0.06] bg-[#060606] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(0,210,255,0.06),transparent_55%)] pointer-events-none" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pleiades/Browse.png"
            alt="Browse app preview"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col p-5 gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-white tracking-wide">
              Browse
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-full uppercase tracking-widest shrink-0">
              {VERSION}
            </span>
          </div>

          <p className="text-[13px] text-white/40 leading-relaxed font-light">
            Everyone app installer — discover, install, and manage packages with
            winget, npm, and more.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {['Windows', 'winget', 'Installer'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-mono text-white/30 border border-white/[0.06] rounded-md bg-white/[0.02]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <a
              href={DOWNLOAD_URL}
              className="white-shine-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/85 hover:text-white transition-colors cursor-pointer w-full"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/30 hover:text-white/60 border border-white/[0.06] hover:border-white/[0.12] rounded-lg bg-transparent transition-all duration-300 cursor-pointer w-full"
            >
              Source
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
