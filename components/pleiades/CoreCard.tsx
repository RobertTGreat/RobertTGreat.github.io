'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Download, ExternalLink } from 'lucide-react';

const SOURCE_URL = 'https://github.com/pleiades-org/Core';
const DOWNLOAD_URL =
  'https://github.com/pleiades-org/Core/releases/download/0.1.3-RC/CoreLauncherSetup.exe';
const VERSION = 'V1.3';

export default function CoreCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/[0.07] via-transparent to-white/[0.03] opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative h-full rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] overflow-hidden backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.14] flex flex-col p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] transition-colors duration-300 group-hover:bg-white/[0.07] group-hover:border-white/[0.14]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pleiades/Core.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-full uppercase tracking-widest">
            {VERSION}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-white tracking-wide mb-1.5">
          Core Launcher
        </h3>
        <p className="text-[13px] text-white/40 leading-relaxed font-light">
          Keyboard-first Windows launcher. Search, clipboard, terminal,
          calculator.
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
          {['Rust', 'GPUI'].map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-mono text-white/30 border border-white/[0.06] rounded-md bg-white/[0.02]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-auto">
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
    </motion.div>
  );
}
