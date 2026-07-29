'use client';

import { useEffect, useState, useRef } from 'react';
import { Type, Check } from 'lucide-react';

export type FontMode = 'default' | 'dyslexic' | 'comic';

export default function FontSwitcher() {
  const [font, setFont] = useState<FontMode>('default');
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-font') as FontMode | null;
    if (saved) {
      setFont(saved);
      applyFontClass(saved);
    }
  }, []);

  const applyFontClass = (mode: FontMode) => {
    document.body.classList.remove('font-dyslexic', 'font-comic');
    if (mode === 'dyslexic') document.body.classList.add('font-dyslexic');
    if (mode === 'comic') document.body.classList.add('font-comic');
  };

  const handleSelect = (mode: FontMode) => {
    setFont(mode);
    localStorage.setItem('portfolio-font', mode);
    applyFontClass(mode);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={popoverRef} className="fixed top-3 right-3 sm:top-6 sm:right-6 z-[300]">
      {/* Icon-Only Button with Frosted Glass */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Font settings"
        aria-label="Font settings"
        className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/65 border border-white/15 text-white/70 hover:text-white hover:border-white/25 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] transition-all cursor-pointer"
      >
        <Type className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Popout Menu */}
      {open ? (
        <div className="absolute right-0 mt-2 w-44 p-1.5 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] font-mono text-xs z-[310] space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10 mb-1">
            Select Font
          </div>

          <button
            type="button"
            onClick={() => handleSelect('default')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
              font === 'default'
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span>Default</span>
            {font === 'default' ? <Check className="w-3.5 h-3.5 text-white" /> : null}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('dyslexic')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
              font === 'dyslexic'
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span>OpenDyslexic</span>
            {font === 'dyslexic' ? <Check className="w-3.5 h-3.5 text-white" /> : null}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('comic')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
              font === 'comic'
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span>Comic Neue</span>
            {font === 'comic' ? <Check className="w-3.5 h-3.5 text-white" /> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}
