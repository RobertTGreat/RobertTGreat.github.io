'use client';

import { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

export type FontMode = 'default' | 'dyslexic' | 'comic';

export default function FontSwitcher() {
  const [font, setFont] = useState<FontMode>('default');

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
  };

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[200] flex items-center gap-1.5 p-1 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-1 px-2 text-white/40 text-xs font-mono border-r border-white/10 pr-2.5">
        <Type className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Font</span>
      </div>

      <button
        type="button"
        onClick={() => handleSelect('default')}
        className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
          font === 'default'
            ? 'bg-white/15 text-white font-medium border border-white/20'
            : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        Default
      </button>

      <button
        type="button"
        onClick={() => handleSelect('dyslexic')}
        className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
          font === 'dyslexic'
            ? 'bg-white/15 text-white font-medium border border-white/20'
            : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        Dyslexic
      </button>

      <button
        type="button"
        onClick={() => handleSelect('comic')}
        className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
          font === 'comic'
            ? 'bg-white/15 text-white font-medium border border-white/20'
            : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        Comic
      </button>
    </div>
  );
}
