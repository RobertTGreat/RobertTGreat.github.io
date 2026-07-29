'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Download, Globe } from 'lucide-react';

const WEB_URL = 'https://pleiades.chat';
const DOWNLOAD_URL =
  'https://fra.cloud.appwrite.io/v1/storage/buckets/6a429317001b2a9ee4e6/files/pleiades-chat-windows-latest/download?project=6a402ba40019ec0418bf';
const VERSION = 'v0.1.2';

const PREVIEWS = [
  { src: '/pleiades/Chat-Server.png', alt: 'Pleiades.Chat server view' },
  { src: '/pleiades/Chat-Profile.png', alt: 'Pleiades.Chat profile view' },
  { src: '/pleiades/Chat-Tweet.png', alt: 'Pleiades.Chat post view' },
];

export default function ChatCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [activePreview, setActivePreview] = useState(0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="md:col-span-2 lg:col-span-2 group relative h-full"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03] opacity-60 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative h-full rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] overflow-hidden backdrop-blur-sm transition-colors duration-500 group-hover:border-white/[0.14]">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] gap-0 min-h-[320px] lg:min-h-[380px]">
          <div className="flex flex-col justify-between p-7 sm:p-9 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/pleiades/Pleiades.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                    Pleiades.Chat
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-full uppercase tracking-widest shrink-0">
                    {VERSION}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-[15px] text-white/45 leading-relaxed font-light max-w-md">
                Communities, voice, LFG, feeds, and profiles — in the browser or
                as a native Windows app. Same account everywhere.
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                {['Tauri', 'React', 'Web', 'Windows'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[11px] font-mono text-white/30 border border-white/[0.06] rounded-md bg-white/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <a
                href={DOWNLOAD_URL}
                className="white-shine-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
              <a
                href={WEB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                Open Web
              </a>
            </div>
          </div>

          <div className="relative border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-[#060606] overflow-hidden min-h-[240px] lg:min-h-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(127,0,255,0.06),transparent_55%)] pointer-events-none z-[1]" />

            {PREVIEWS.map((preview, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={preview.src}
                src={preview.src}
                alt={preview.alt}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-[1.02] ${
                  i === activePreview ? 'opacity-90' : 'opacity-0'
                }`}
              />
            ))}

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent pointer-events-none z-[1]" />

            <div className="absolute inset-x-0 bottom-0 z-[2] p-3 sm:p-4 flex gap-2">
              {PREVIEWS.map((preview, i) => (
                <button
                  key={preview.src}
                  type="button"
                  onClick={() => setActivePreview(i)}
                  aria-label={`Show preview ${i + 1}`}
                  className={`relative flex-1 h-11 sm:h-12 rounded-md overflow-hidden border transition-all duration-300 cursor-pointer ${
                    i === activePreview
                      ? 'border-white/30 ring-1 ring-white/20'
                      : 'border-white/[0.08] opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.src}
                    alt=""
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
