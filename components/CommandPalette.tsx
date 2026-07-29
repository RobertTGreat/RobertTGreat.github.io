'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, BookOpen, ArrowRight, CornerDownLeft, Tag } from 'lucide-react';
import { conceptPapers, type ConceptPaper } from '@/data/concept-papers';

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onSelectPaper: (paper: ConceptPaper) => void;
};

export default function CommandPalette({
  open,
  onClose,
  onSelectPaper,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'paper' | 'blog'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter papers
  const filtered = conceptPapers.filter((paper) => {
    const matchesType = filterType === 'all' || (paper.type ?? 'paper') === filterType;
    const q = query.toLowerCase().trim();
    if (!q) return matchesType;

    const matchesQuery =
      paper.title.toLowerCase().includes(q) ||
      (paper.subtitle && paper.subtitle.toLowerCase().includes(q)) ||
      paper.description.toLowerCase().includes(q) ||
      paper.tags.some((t) => t.toLowerCase().includes(q));

    return matchesType && matchesQuery;
  });

  // Collect all unique tags for quick filter pills
  const allTags = Array.from(new Set(conceptPapers.flatMap((p) => p.tags)));

  const handleSelect = useCallback(
    (paper: ConceptPaper) => {
      onSelectPaper(paper);
      onClose();
    },
    [onSelectPaper, onClose]
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelect(filtered[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, filtered, selectedIndex, handleSelect]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[160] flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search papers and blogs"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-opacity animate-in fade-in"
        aria-label="Close search modal"
      />

      {/* Command Palette Card */}
      <div className="relative z-[1] w-full max-w-xl bg-[#09090c]/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search papers, blogs, or tags..."
            className="flex-1 bg-transparent text-sm font-mono text-white placeholder-white/30 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-white/30 hover:text-white p-1 text-xs font-mono cursor-pointer"
            >
              Clear
            </button>
          ) : null}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-white/30 bg-white/[0.04] border border-white/10 rounded-md select-none">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 cursor-pointer sm:hidden"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/40 overflow-x-auto text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            All ({conceptPapers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('paper')}
            className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
              filterType === 'paper'
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Technical Papers
          </button>
          <button
            type="button"
            onClick={() => setFilterType('blog')}
            className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
              filterType === 'blog'
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Blogs
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((paper, idx) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => handleSelect(paper)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                  idx === selectedIndex
                    ? 'bg-white/10 border border-white/15 text-white'
                    : 'bg-transparent border border-transparent text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono rounded uppercase tracking-wider bg-white/[0.06] text-white/60 border border-white/10">
                      <BookOpen className="w-2.5 h-2.5" />
                      {paper.type === 'blog' ? 'Blog' : 'Technical Paper'}
                    </span>
                    {paper.readTime ? (
                      <span className="text-[10px] font-mono text-white/40">• {paper.readTime}</span>
                    ) : null}
                  </div>
                  <h4 className="font-display text-sm font-semibold text-white group-hover:text-white truncate">
                    {paper.title}
                  </h4>
                  {paper.subtitle ? (
                    <p className="text-xs font-mono text-white/50 truncate">{paper.subtitle}</p>
                  ) : null}
                  <p className="text-xs text-white/40 line-clamp-1 font-light">{paper.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-white/30 group-hover:text-white pt-1">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-10 text-center text-xs font-mono text-white/40 space-y-2">
              <p>No matching papers or blogs found.</p>
              {allTags.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-sm mx-auto">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[10px] text-white/50 hover:text-white cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
