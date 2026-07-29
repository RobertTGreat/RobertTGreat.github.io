'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlignLeft, Link as LinkIcon, Check } from 'lucide-react';
import type { ConceptPaper } from '@/data/concept-papers';

type PaperReaderModalProps = {
  open: boolean;
  onClose: () => void;
  paper: ConceptPaper | null;
};

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export default function PaperReaderModal({
  open,
  onClose,
  paper,
}: PaperReaderModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showTocMobile, setShowTocMobile] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const mainRef = useRef<HTMLElement>(null);

  const fetchPaper = useCallback(async (fileUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Failed to load paper (${res.status})`);
      const text = await res.text();
      setContent(text);

      // Extract headings for Table of Contents
      const lines = text.split('\n');
      const items: TocItem[] = [];
      lines.forEach((line) => {
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const rawText = match[2].trim();
          const cleanText = rawText.replace(/[*_`]/g, '');
          const id = cleanText
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          items.push({ id, text: cleanText, level });
        }
      });
      setToc(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopyShareLink = () => {
    if (!paper) return;
    const url = new URL(window.location.href);
    url.searchParams.set('paper', paper.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (open && paper) {
      fetchPaper(paper.fileUrl);
    } else {
      setContent('');
      setToc([]);
    }
  }, [open, paper, fetchPaper]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const scrollToHeading = (id: string) => {
    if (!mainRef.current) return;
    const target = mainRef.current.querySelector(`#${id}`) as HTMLElement | null;
    if (target) {
      const containerTop = mainRef.current.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const relativeTop = targetTop - containerTop + mainRef.current.scrollTop;
      mainRef.current.scrollTo({ top: relativeTop - 20, behavior: 'smooth' });
      setShowTocMobile(false);
    }
  };

  if (!open || !paper || typeof document === 'undefined') return null;

  const renderSimpleMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let inTable = false;
    let tableBuffer: string[] = [];

    const flushCodeBlock = (key: string) => {
      if (codeBuffer.length > 0) {
        elements.push(
          <pre
            key={key}
            className="my-5 p-4 sm:p-5 rounded-xl bg-[#0b0b0b] border border-white/10 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto leading-relaxed shadow-inner"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
      }
    };

    const flushTable = (key: string) => {
      if (tableBuffer.length > 0) {
        const rows = tableBuffer.map((r) =>
          r
            .split('|')
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim())
        );
        tableBuffer = [];
        if (rows.length === 0) return;
        const [headers, separator, ...body] = rows;

        elements.push(
          <div key={key} className="my-6 overflow-x-auto rounded-xl border border-white/10 shadow-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              {headers ? (
                <thead className="bg-white/[0.05] border-b border-white/10 text-white/90 font-mono">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-semibold">
                        {formatInlineText(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              {body.length > 0 ? (
                <tbody className="divide-y divide-white/[0.06] bg-[#070707]">
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3 text-white/75">
                          {formatInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ) : null}
            </table>
          </div>
        );
      }
    };

    lines.forEach((line, idx) => {
      const key = `line-${idx}`;

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          flushCodeBlock(`code-${key}`);
        } else {
          if (inTable) {
            inTable = false;
            flushTable(`tbl-${key}`);
          }
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.trim().startsWith('|')) {
        if (!inTable) inTable = true;
        tableBuffer.push(line);
        return;
      } else if (inTable) {
        inTable = false;
        flushTable(`tbl-${key}`);
      }

      if (line.startsWith('# ')) {
        const titleText = line.replace('# ', '').trim();
        const id = titleText
          .replace(/[*_`]/g, '')
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h1
            id={id}
            key={key}
            className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wide mt-10 mb-6 border-b border-white/10 pb-4 scroll-mt-6"
          >
            {formatInlineText(titleText)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        const titleText = line.replace('## ', '').trim();
        const id = titleText
          .replace(/[*_`]/g, '')
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h2
            id={id}
            key={key}
            className="font-display text-2xl sm:text-3xl font-semibold text-white/95 tracking-wide mt-10 mb-4 border-b border-white/[0.06] pb-2 scroll-mt-6"
          >
            {formatInlineText(titleText)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        const titleText = line.replace('### ', '').trim();
        const id = titleText
          .replace(/[*_`]/g, '')
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h3
            id={id}
            key={key}
            className="font-display text-xl sm:text-2xl font-semibold text-emerald-400 tracking-wide mt-8 mb-3 scroll-mt-6"
          >
            {formatInlineText(titleText)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        const titleText = line.replace('#### ', '').trim();
        elements.push(
          <h4 key={key} className="font-display text-lg font-semibold text-white/80 mt-6 mb-2">
            {formatInlineText(titleText)}
          </h4>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={key} className="my-8 border-white/10" />);
      } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().replace(/^[*|-]\s+/, '');
        elements.push(
          <li key={key} className="ml-5 list-disc text-white/80 my-1.5 leading-relaxed text-sm sm:text-base">
            {formatInlineText(itemText)}
          </li>
        );
      } else if (/^\d+\.\s+/.test(line.trim())) {
        const itemText = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <li key={key} className="ml-5 list-decimal text-white/80 my-1.5 leading-relaxed text-sm sm:text-base">
            {formatInlineText(itemText)}
          </li>
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={key} className="my-3.5 text-white/75 leading-relaxed text-sm sm:text-base font-light">
            {formatInlineText(line)}
          </p>
        );
      }
    });

    if (inCodeBlock) flushCodeBlock('code-end');
    if (inTable) flushTable('tbl-end');

    return elements;
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-white/85">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-emerald-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={paper.title}
    >
      {/* Dim backdrop with click-off listener */}
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        aria-label="Close modal"
        onClick={onClose}
      />

      {/* Reader Popup Container */}
      <div className="relative z-[1] w-full max-w-7xl h-[92vh] flex flex-col bg-[#070707] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Floating Top Control Row */}
        <div className="absolute top-4 right-4 sm:right-6 z-30 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-black/80 text-xs font-mono text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5 text-white/60" />
                <span>Share</span>
              </>
            )}
          </button>

          {toc.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowTocMobile(!showTocMobile)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-black/80 text-xs font-mono text-white/80 hover:text-white backdrop-blur-md"
            >
              <AlignLeft className="w-4 h-4" />
              Contents
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-black/80 text-white/70 hover:text-white hover:border-white/20 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reader Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Table of Contents Sidebar */}
          {toc.length > 0 ? (
            <aside
              className={`absolute lg:relative inset-y-0 left-0 z-20 w-72 sm:w-80 bg-[#090909] border-r border-white/[0.08] p-6 overflow-y-auto transition-transform duration-300 shrink-0 ${
                showTocMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`}
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  <AlignLeft className="w-4 h-4" />
                  Table of Contents
                </div>
                <button
                  type="button"
                  onClick={() => setShowTocMobile(false)}
                  className="lg:hidden text-white/40 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-2">
                {toc.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg hover:bg-white/[0.04] hover:text-emerald-300 transition-all truncate cursor-pointer ${
                      item.level === 1
                        ? 'font-medium text-white/90 text-xs sm:text-sm bg-white/[0.02]'
                        : item.level === 2
                        ? 'pl-4 text-white/60 text-xs'
                        : 'pl-7 text-white/40 text-xs'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </aside>
          ) : null}

          {/* Main Reading Canvas */}
          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto px-6 sm:px-16 lg:px-24 py-12 bg-[#050505] text-gray-200 scroll-smooth"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
                <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono">Loading document...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-red-400 text-sm max-w-xl mx-auto my-12">
                {error}
              </div>
            ) : (
              <article className="max-w-4xl mx-auto font-sans selection:bg-emerald-500/30 selection:text-emerald-100 pb-24">
                {renderSimpleMarkdown(content)}
              </article>
            )}
          </main>
        </div>
      </div>
    </div>,
    document.body
  );
}
