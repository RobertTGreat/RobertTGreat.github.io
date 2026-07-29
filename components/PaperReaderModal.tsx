'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlignLeft, Link as LinkIcon, Check, Copy } from 'lucide-react';
import katex from 'katex';
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
  const [showToc, setShowToc] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const mainRef = useRef<HTMLElement>(null);

  const slugifyToId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const fetchPaper = useCallback(async (fileUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Failed to load paper (${res.status})`);
      const text = await res.text();
      setContent(text);

      // Extract headings for Table of Contents
      const lines = text.split(/\r?\n/);
      const items: TocItem[] = [];
      lines.forEach((line) => {
        const trimmed = line.trim();
        const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const rawText = match[2].trim();
          const cleanText = rawText.replace(/[*_`]/g, '');

          // Filter rule: Only include main section headings (# / ## / ###), numbered sections (e.g., "1.1", "Section 1"), "Abstract", or "Conclusion"
          const isAbstract = /^abstract$/i.test(cleanText);
          const isConclusion = /^conclusion$/i.test(cleanText);
          const isNumberedSection = /^(section|\d+([\.\s]|$))/i.test(cleanText);

          if (isAbstract || isConclusion || isNumberedSection) {
            const id = slugifyToId(cleanText);
            items.push({ id, text: cleanText, level });
          }
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
    const target = document.getElementById(id);
    if (target && mainRef.current.contains(target)) {
      const containerTop = mainRef.current.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const relativeTop = targetTop - containerTop + mainRef.current.scrollTop;
      mainRef.current.scrollTo({ top: relativeTop - 20, behavior: 'smooth' });
    }
  };

  if (!open || !paper || typeof document === 'undefined') return null;

  const renderSimpleMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLang = '';
    let codeBuffer: string[] = [];
    let inTable = false;
    let tableBuffer: string[] = [];
    let inMathBlock = false;
    let mathBuffer: string[] = [];

    const flushCodeBlock = (key: string) => {
      if (codeBuffer.length > 0) {
        const codeText = codeBuffer.join('\n');
        if (codeLang === 'diagram' || codeLang === 'flowchart' || isAsciiDiagram(codeText)) {
          elements.push(<DiagramCard key={key} code={codeText} />);
        } else {
          elements.push(<CodeBlockCard key={key} code={codeText} lang={codeLang} />);
        }
        codeBuffer = [];
        codeLang = '';
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

    const flushMathBlock = (key: string) => {
      if (mathBuffer.length > 0) {
        const tex = mathBuffer.join('\n');
        elements.push(renderKatexDisplayBlock(tex, key));
        mathBuffer = [];
      }
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const key = `line-${idx}`;

      // Display math block $$ ... $$
      if (line.trim() === '$$') {
        if (inMathBlock) {
          inMathBlock = false;
          flushMathBlock(`math-${key}`);
        } else {
          if (inCodeBlock) {
            inCodeBlock = false;
            flushCodeBlock(`code-${key}`);
          }
          if (inTable) {
            inTable = false;
            flushTable(`tbl-${key}`);
          }
          inMathBlock = true;
        }
        continue;
      }

      if (inMathBlock) {
        mathBuffer.push(line);
        continue;
      }

      if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
        const tex = line.trim().slice(2, -2).trim();
        elements.push(renderKatexDisplayBlock(tex, `math-inline-${key}`));
        continue;
      }

      // Code blocks ```
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
          codeLang = line.trim().replace(/^```/, '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.trim().startsWith('|')) {
        if (!inTable) inTable = true;
        tableBuffer.push(line);
        continue;
      } else if (inTable) {
        inTable = false;
        flushTable(`tbl-${key}`);
      }

      if (line.startsWith('# ')) {
        const titleText = line.replace('# ', '').trim();
        const cleanTitle = titleText.replace(/[*_`]/g, '');
        const id = slugifyToId(cleanTitle);
        elements.push(
          <h1
            id={id}
            key={key}
            className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wide mt-12 mb-6 border-b border-white/10 pb-4 scroll-mt-6"
          >
            {formatInlineText(titleText)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        const titleText = line.replace('## ', '').trim();
        const cleanTitle = titleText.replace(/[*_`]/g, '');
        const id = slugifyToId(cleanTitle);
        elements.push(
          <h2
            id={id}
            key={key}
            className="font-display text-2xl sm:text-3xl font-semibold text-white/90 tracking-wide mt-10 mb-4 border-b border-white/[0.06] pb-2 scroll-mt-6"
          >
            {formatInlineText(titleText)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        const titleText = line.replace('### ', '').trim();
        const cleanTitle = titleText.replace(/[*_`]/g, '');
        const id = slugifyToId(cleanTitle);
        elements.push(
          <h3
            id={id}
            key={key}
            className="font-display text-xl sm:text-2xl font-semibold text-white/75 tracking-wide mt-8 mb-3 scroll-mt-6"
          >
            {formatInlineText(titleText)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        const titleText = line.replace('#### ', '').trim();
        elements.push(
          <h4 key={key} className="font-display text-lg font-semibold text-white/60 mt-6 mb-2">
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
    }

    if (inCodeBlock) flushCodeBlock('code-end');
    if (inTable) flushTable('tbl-end');
    if (inMathBlock) flushMathBlock('math-end');

    return elements;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={paper.title}
    >
      {/* Dim backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        aria-label="Close modal"
        onClick={onClose}
      />

      {/* Centered Modal Wrapper containing floating outside ToC + main reader box */}
      <div className="relative z-[1] flex items-center justify-center w-full max-w-6xl h-[92vh]">
        {/* Table of Contents */}
        {toc.length > 0 && showToc ? (
          <aside className="xl:absolute xl:right-full xl:mr-4 xl:top-0 max-xl:fixed max-xl:left-4 max-xl:top-16 max-xl:right-4 max-xl:sm:right-auto max-xl:sm:w-80 max-xl:max-h-[70vh] z-[150] bg-[#0a0a0a]/95 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-2xl overflow-y-auto shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/80 font-semibold">
                <AlignLeft className="w-3.5 h-3.5" />
                Table of Contents
              </div>
              <button
                type="button"
                onClick={() => setShowToc(false)}
                className="text-white/40 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {toc.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    scrollToHeading(item.id);
                    // Close mobile drawer on item tap if on small screens
                    if (window.innerWidth < 1280) setShowToc(false);
                  }}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-white/10 hover:text-white transition-all truncate cursor-pointer ${
                    item.level === 1
                      ? 'font-medium text-white text-xs bg-white/[0.04]'
                      : item.level === 2
                      ? 'pl-3 text-white/70 text-xs'
                      : 'pl-6 text-white/50 text-xs'
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </aside>
        ) : null}

        {/* Reader Popup Container */}
        <div className="relative z-[1] w-full h-full flex flex-col bg-[#070707] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top Left Floating Controls */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-6 z-30 flex items-center gap-2">
            {toc.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowToc(!showToc)}
                title={showToc ? 'Hide Table of Contents' : 'Show Table of Contents'}
                aria-label="Toggle Table of Contents"
                className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md transition-all cursor-pointer ${
                  showToc
                    ? 'text-white border-white/30 bg-white/10'
                    : 'text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <AlignLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleCopyShareLink}
              title={copied ? 'Link Copied' : 'Share Paper Link'}
              aria-label="Share paper link"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/10 bg-black/80 text-white/70 hover:text-white hover:border-white/20 backdrop-blur-md transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-in fade-in" />
              ) : (
                <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              )}
            </button>
          </div>

          {/* Top Right Control */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-30">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/10 bg-black/80 text-white/70 hover:text-white hover:border-white/20 backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Close reader"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Reader Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            <main
              ref={mainRef}
              className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-16 py-14 sm:py-16 bg-[#050505] text-gray-200 scroll-smooth flex justify-center relative"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
                  <div className="w-7 h-7 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono">Loading document...</p>
                </div>
              ) : error ? (
                <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-red-400 text-sm max-w-xl mx-auto my-12">
                  {error}
                </div>
              ) : (
                <article className="w-full max-w-3xl font-sans selection:bg-white/20 selection:text-white pb-24">
                  {renderSimpleMarkdown(content)}
                </article>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* --- Helpers & Sub-components --- */

function renderKatexDisplayBlock(tex: string, key: string) {
  try {
    const html = katex.renderToString(tex, { displayMode: true, throwOnError: false });
    return (
      <div
        key={key}
        className="my-6 p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/12 text-white/95 overflow-x-auto shadow-2xl flex justify-center items-center font-mono text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <div key={key} className="my-4 p-4 rounded-xl bg-white/5 text-white/80 font-mono text-xs overflow-x-auto">
        {tex}
      </div>
    );
  }
}

function formatInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith('$$') && part.endsWith('$$')) {
      const mathStr = part.slice(2, -2).trim();
      return renderKatexDisplayBlock(mathStr, `math-${i}`);
    }

    if (part.startsWith('$') && part.endsWith('$')) {
      const mathStr = part.slice(1, -1).trim();
      try {
        const html = katex.renderToString(mathStr, { displayMode: false, throwOnError: false });
        return <span key={i} className="inline-block px-1" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <code key={i} className="px-1 text-xs font-mono text-white/90">{mathStr}</code>;
      }
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-white/10 text-white/90 font-mono text-[0.85em] border border-white/10"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-white/85">{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function isAsciiDiagram(text: string): boolean {
  return /[┌┼│▼─┴┐─►]/.test(text) || (text.includes('┌') && text.includes('┐'));
}

function cleanTitle(text: string): string {
  return text.replace(/^[\[\s]+|[\]\s]+$/g, '').trim();
}

/* --- Code Block Card with Line Numbers & Vibrant Syntax Highlighting --- */
function CodeBlockCard({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative my-6 rounded-2xl bg-[#08080c] border border-white/10 overflow-hidden shadow-2xl">
      {/* Inline Floating Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {lang ? (
          <span className="px-2 py-0.5 rounded border border-white/10 bg-white/[0.04] text-[10px] font-mono uppercase tracking-wider text-purple-300/80">
            {lang}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-black/70 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-[11px] font-mono backdrop-blur-md"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 pt-9 overflow-x-auto font-mono text-[11px] sm:text-xs leading-[1.65] bg-[#050508]">
        {lines.map((line, i) => (
          <div key={i} className="flex hover:bg-white/[0.02] transition-colors">
            <span className="select-none w-8 text-right pr-4 text-white/20 text-[10px]">{i + 1}</span>
            <span className="text-white/90 whitespace-pre">{highlightSyntax(line)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightSyntax(line: string): React.ReactNode {
  // Rich syntax highlighting for keywords, properties, types, strings, comments
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-white/40 italic">{line}</span>;
  }

  const keywordRegex = /\b(STRUCT|END|Field|Integer|Float|UUID|Vector3|Unsigned|Single|Precision|Boolean|if|else|return|case|default|break|const|let|var|function|type|interface|class|import|export|from)\b/g;
  const parts = line.split(keywordRegex);

  return parts.map((part, idx) => {
    if (keywordRegex.test(part)) {
      return (
        <span key={idx} className="text-purple-400 font-semibold">
          {part}
        </span>
      );
    }
    if (part.includes(':')) {
      const [left, ...right] = part.split(':');
      return (
        <span key={idx}>
          <span className="text-blue-300">{left}</span>
          <span className="text-white/40">:</span>
          <span className="text-emerald-400">{right.join(':')}</span>
        </span>
      );
    }
    return part;
  });
}

/* --- SVG Branch Connector --- */
function BranchConnector({ cols, gap }: { cols: number; gap: number }) {
  // Draws: vertical line down from center → horizontal bar spanning col centers → vertical drops to each col
  // For a flex/grid with N cols and gap px, each col width = (W - (N-1)*gap) / N
  // Col i center (0-indexed) = colWidth/2 + i * (colWidth + gap)
  // As percentage of W: centerPct(i) = (colWidth/2 + i*(colWidth+gap)) / W * 100
  // Where W = N*colWidth + (N-1)*gap → colWidth = (W - (N-1)*gap)/N
  // Simplify with W=100%:
  // colWidth% = (100 - (N-1)*gapPx/W*100) / N  — but gap is in px, not %. 
  // Use calc() in SVG via percentage + px offsets.
  
  // For simplicity, compute the exact percentages assuming a reasonable container width.
  // The gap in Tailwind: gap-4 = 16px, gap-6 = 24px
  // We'll use SVG with calc-based positions via inline style on <line>.
  
  // Alternative: use a simple approach where the horizontal bar is drawn as a border on a wrapper.
  
  const lineColor = 'rgba(255,255,255,0.3)';
  const h = 32; // total height of connector area

  // For N columns with equal flex, each column center is at:
  // center_i = (2*i + 1) / (2*N) as a fraction, PLUS gap offset
  // More precisely with gap in px:
  // center_i_px = ((100% - (N-1)*gap) / N) / 2 + i * ((100% - (N-1)*gap) / N + gap)
  // This is complex in SVG. Let's use a clever CSS approach instead.

  // We'll render a relative container and use absolutely positioned divs with calc().
  const totalGap = (cols - 1) * gap;
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Vertical stem from parent */}
      <div className="w-[1.5px] h-4 bg-white/30" />
      
      {/* Horizontal bar + vertical drops container */}
      <div className="w-full relative" style={{ height: h }}>
        {/* Horizontal bar from col-0-center to col-(N-1)-center */}
        <div 
          className="absolute h-[1.5px] bg-white/30"
          style={{ 
            top: 0,
            left: `calc((100% - ${totalGap}px) / ${cols} / 2)`,
            right: `calc((100% - ${totalGap}px) / ${cols} / 2)`,
          }}
        />
        
        {/* Vertical drops for each column */}
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[1.5px] bg-white/30"
            style={{
              top: 0,
              height: h,
              left: `calc((100% - ${totalGap}px) / ${cols} / 2 + ${i} * ((100% - ${totalGap}px) / ${cols} + ${gap}px))`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* --- Vertical connector line between two nodes --- */
function VerticalConnector() {
  return <div className="w-[1.5px] h-8 bg-white/30" />;
}

/* --- Diagram Viewer Card (Monochrome Visual Graph + Inline ASCII Selector) --- */
function DiagramCard({ code }: { code: string }) {
  const [viewMode, setViewMode] = useState<'visual' | 'ascii'>('visual');

  return (
    <div className="relative my-6 rounded-2xl bg-[#070709] border border-white/10 overflow-hidden shadow-2xl group">
      {/* Inline Floating Selector Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <div className="flex items-center p-0.5 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-white/15 text-white font-medium border border-white/15'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ascii')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'ascii'
                ? 'bg-white/15 text-white font-medium border border-white/15'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            ASCII
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'visual' ? (
        <div className="p-6 sm:p-8 pt-12 overflow-x-auto bg-[#070709]">
          {renderVisualFlowchart(code)}
        </div>
      ) : (
        <pre
          style={{ fontFamily: 'var(--font-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, monospace' }}
          className="p-5 sm:p-6 pt-12 font-mono text-[11px] sm:text-xs text-white/90 overflow-x-auto leading-[1.35] whitespace-pre bg-[#040406] tracking-normal font-normal select-text"
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function renderVisualFlowchart(code: string): React.ReactNode {
  // Diagram 1: Swept collision volume
  if (code.includes('SWEEP VOLUME GENERATION')) {
    return (
      <div className="flex flex-col items-center min-w-[650px] py-2">
        {/* Node 1 */}
        <div className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 font-mono text-xs font-semibold uppercase tracking-wider">
          ATTACK INITIATION (Active Frames)
        </div>

        <VerticalConnector />

        {/* Node 2 */}
        <div className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 font-mono text-xs font-semibold uppercase tracking-wider">
          SWEEP VOLUME GENERATION (Frame N to N-1)
        </div>

        {/* 3-Way Branch Connector — gap-4 = 16px */}
        <BranchConnector cols={3} gap={16} />

        {/* 3 Cards */}
        <div className="w-full grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="w-full text-center px-3 py-1 rounded-lg bg-white/[0.06] text-white/90 text-[11px] font-mono font-semibold border border-white/10">
              {cleanTitle('ENCOUNTER ENEMY PARRY')}
            </span>
            <div className="w-[1.5px] h-3 bg-white/20" />
            <div className="text-xs font-semibold text-white/80">Evaluate Frame Window</div>
            <ul className="text-[11px] text-white/60 space-y-1 text-left w-full font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
              <li>• Tier 3: Parry Match</li>
              <li>• Tier 2: Block Absorb</li>
            </ul>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="w-full text-center px-3 py-1 rounded-lg bg-white/[0.06] text-white/90 text-[11px] font-mono font-semibold border border-white/10">
              {cleanTitle('ENCOUNTER ENEMY BODY')}
            </span>
            <div className="w-[1.5px] h-3 bg-white/20" />
            <div className="text-xs font-semibold text-white/80">Calculate Hit Location</div>
            <ul className="text-[11px] text-white/60 space-y-1 text-left w-full font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
              <li>• Tip vs. Shaft Ratio</li>
              <li>• Procedural IK Recoil</li>
            </ul>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="w-full text-center px-3 py-1 rounded-lg bg-white/[0.06] text-white/90 text-[11px] font-mono font-semibold border border-white/10">
              {cleanTitle('ENCOUNTER ENVIRONMENT')}
            </span>
            <div className="w-[1.5px] h-3 bg-white/20" />
            <div className="text-xs font-semibold text-white/80">Apply Wall Drag Friction</div>
            <ul className="text-[11px] text-white/60 space-y-1 text-left w-full font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
              <li>• Reduce Swing Velocity</li>
              <li>• Scale Hit Damage Down</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Diagram 2: Morph / Feint Lifecycle
  if (code.includes('Phase 1: Morph')) {
    return (
      <div className="flex items-stretch min-w-[650px] py-2">
        <div className="flex-1 p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="text-xs font-bold font-mono text-white/90 bg-white/[0.06] px-3 py-1.5 rounded-lg inline-block border border-white/10">
            Phase 1: Morph / Feint
          </div>
          <div className="text-[11px] font-mono text-white/40">(0% to 45% Windup)</div>
          <ul className="text-xs text-white/70 space-y-1.5 font-light pt-1">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Morphing permitted</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Guard switch allowed</li>
          </ul>
        </div>

        <div className="flex items-center px-1 shrink-0">
          <div className="w-6 h-[1.5px] bg-white/30" />
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="text-xs font-bold font-mono text-white/90 bg-white/[0.06] px-3 py-1.5 rounded-lg inline-block border border-white/10">
            Phase 2: Point of No Return
          </div>
          <div className="text-[11px] font-mono text-white/40">(46% to 59% Windup)</div>
          <ul className="text-xs text-white/70 space-y-1.5 font-light pt-1">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Animation committed</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Telegraph locked</li>
          </ul>
        </div>

        <div className="flex items-center px-1 shrink-0">
          <div className="w-6 h-[1.5px] bg-white/30" />
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="text-xs font-bold font-mono text-white/90 bg-white/[0.06] px-3 py-1.5 rounded-lg inline-block border border-white/10">
            Phase 3: Active Swing
          </div>
          <div className="text-[11px] font-mono text-white/40">(60% to 100% Active)</div>
          <ul className="text-xs text-white/70 space-y-1.5 font-light pt-1">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Swept raycasts ACTIVE</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Signals emit on contact</li>
          </ul>
        </div>
      </div>
    );
  }

  // Diagram 3: Hardware Input Queue
  if (code.includes('HARDWARE INPUT RECEIVED')) {
    return (
      <div className="flex flex-col items-center min-w-[500px] py-2">
        <div className="px-5 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 font-mono text-xs font-semibold">
          HARDWARE INPUT RECEIVED
        </div>

        <VerticalConnector />

        <div className="px-5 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 font-mono text-xs font-bold">
          System in Hitstop Freeze?
        </div>

        {/* 2-Way Branch Connector — gap-6 = 24px */}
        <BranchConnector cols={2} gap={24} />

        <div className="w-full grid grid-cols-2 gap-6">
          {/* YES Branch */}
          <div className="flex flex-col items-center p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="px-3 py-1 rounded bg-white/[0.06] text-white/90 font-mono text-xs font-bold border border-white/10">YES</span>
            <div className="w-[1.5px] h-3 bg-white/20" />
            <div className="text-xs font-semibold text-white/80">Store in Priority Queue</div>
            <div className="text-[11px] font-mono text-white/40">(Raw Hardware Engine Time)</div>
            <div className="w-[1.5px] h-3 bg-white/20" />
            <div className="px-3 py-1.5 rounded bg-white/[0.04] text-white/80 text-xs font-mono border border-white/10">
              Flush Highest Priority Action
            </div>
          </div>

          {/* NO Branch */}
          <div className="flex flex-col items-center p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="px-3 py-1 rounded bg-white/[0.06] text-white/90 font-mono text-xs font-bold border border-white/10">NO</span>
            <div className="w-[1.5px] h-3 bg-white/20" />
            <div className="text-xs font-semibold text-white/80">Pass to Motion Engine</div>
            <div className="text-[11px] text-white/50 font-mono">• Instant execution</div>
          </div>
        </div>
      </div>
    );
  }

  // Diagram 4: Modular Netcode Architecture
  if (code.includes('CLIENT HARDWARE INPUT')) {
    return (
      <div className="flex flex-col items-center min-w-[600px] py-2">
        <div className="px-5 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 font-mono text-xs font-semibold">
          CLIENT HARDWARE INPUT
        </div>

        <VerticalConnector />

        <div className="px-5 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 font-mono text-xs font-semibold">
          PREDICTIVE LOCAL RAYCAST SWEEP
        </div>

        {/* 2-Way Branch Connector — gap-6 = 24px */}
        <BranchConnector cols={2} gap={24} />

        <div className="w-full grid grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-center">
            <div className="text-xs font-mono font-bold text-white/90 bg-white/[0.06] px-3 py-1 rounded-lg inline-block border border-white/10">
              {cleanTitle('SINGLEPLAYER ROUTE')}
            </div>
            <ul className="text-xs text-white/70 space-y-1.5 font-mono pt-1 text-left">
              <li>• Direct Hitstop Execution</li>
              <li>• Local IK Recoil Application</li>
              <li>• Instant State Resolution</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-center">
            <div className="text-xs font-mono font-bold text-white/90 bg-white/[0.06] px-3 py-1 rounded-lg inline-block border border-white/10">
              {cleanTitle('THEORETICAL NETCODE ROUTE')}
            </div>
            <ul className="text-xs text-white/70 space-y-1.5 font-mono pt-1 text-left">
              <li>• Timestamp Payload Serialized</li>
              <li>• Server Rewind (Tick minus Latency)</li>
              <li>• Snapshot Reconciliation Pass</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Fallback generic visual renderer for any unhandled diagram
  return (
    <pre
      style={{ fontFamily: 'var(--font-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, monospace' }}
      className="p-4 font-mono text-xs text-white/90 overflow-x-auto leading-relaxed whitespace-pre"
    >
      <code>{code}</code>
    </pre>
  );
}
