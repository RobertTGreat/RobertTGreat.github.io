'use client';

import { useEffect, useState } from 'react';
import { Github, Mail, MapPin } from 'lucide-react';
import StarryCanvas from '@/components/StarryCanvas';
import SectionHeader from '@/components/SectionHeader';
import ProjectCard from '@/components/ProjectCard';
import DesignCard from '@/components/DesignCard';
import ConceptPaperCard from '@/components/ConceptPaperCard';
import PaperReaderModal from '@/components/PaperReaderModal';
import FontSwitcher from '@/components/FontSwitcher';
import ChatCard from '@/components/pleiades/ChatCard';
import BrowseCard from '@/components/pleiades/BrowseCard';
import CoreCard from '@/components/pleiades/CoreCard';
import SearchCard from '@/components/pleiades/SearchCard';
import { personalProjects } from '@/data/personal-projects';
import { designWork } from '@/data/design-work';
import { conceptPapers, type ConceptPaper } from '@/data/concept-papers';

const GITHUB = 'https://github.com/RobertTGreat';
const PLEIADES = 'https://www.pleiades.org.uk/';
const EMAIL = 'robert.robertsonid@gmail.com';
const LOCATION = 'Glasgow · Scotland';

export default function Home() {
  const [activePaper, setActivePaper] = useState<ConceptPaper | null>(null);
  const [paperSearch, setPaperSearch] = useState('');
  const [paperSort, setPaperSort] = useState<'newest' | 'title'>('newest');

  // Handle URL deep-linking (e.g. ?paper=ashen-edge)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paperId = params.get('paper');
    if (paperId) {
      const found = conceptPapers.find((p) => p.id === paperId);
      if (found) setActivePaper(found);
    }
  }, []);

  const filteredPapers = conceptPapers
    .filter((paper) => {
      const q = paperSearch.toLowerCase();
      return (
        paper.title.toLowerCase().includes(q) ||
        (paper.subtitle && paper.subtitle.toLowerCase().includes(q)) ||
        paper.description.toLowerCase().includes(q) ||
        paper.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (paperSort === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default newest (by date or order)
      return (b.date || '').localeCompare(a.date || '');
    });

  return (
    <div className="relative bg-[#010101] text-gray-200 font-sans selection:bg-white/20 selection:text-white">
      <FontSwitcher />
      <StarryCanvas />

      <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="h-12" />

        {/* Hero */}
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center py-12 sm:py-16 lg:py-24 text-center gap-5 sm:gap-6">
          <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.24em] sm:tracking-[0.28em] text-white/35">
            Portfolio
          </p>
          <h1 className="font-display text-4xl xs:text-5xl sm:text-7xl lg:text-8xl font-bold tracking-[0.1em] sm:tracking-[0.18em] text-white leading-none">
            ROBERT
          </h1>
          <p className="text-xs sm:text-base text-white/45 font-light max-w-md leading-relaxed px-2">
            Software, tools, and design — personal work, Pleiades products, and
            visual craft.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-[11px] sm:text-[12px] font-mono text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/25 shrink-0" />
              {LOCATION}
            </span>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-1.5 hover:text-white/70 transition-colors break-all"
            >
              <Mail className="w-3.5 h-3.5 text-white/25 shrink-0" />
              {EMAIL}
            </a>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="white-shine-btn p-3.5 sm:p-4 cursor-pointer"
              aria-label="GitHub profile"
            >
              <Github className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a
              href={PLEIADES}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/50 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
            >
              pleiades.org.uk
            </a>
          </div>

          {/* Jump links */}
          <nav className="flex flex-wrap justify-center gap-x-2 sm:gap-x-6 gap-y-1.5 mt-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white/35">
            <a href="#projects" className="px-2.5 py-1 rounded-md hover:bg-white/[0.05] hover:text-white/70 transition-colors">
              Projects
            </a>
            <a href="#pleiades" className="px-2.5 py-1 rounded-md hover:bg-white/[0.05] hover:text-white/70 transition-colors">
              Pleiades
            </a>
            <a href="#papers" className="px-2.5 py-1 rounded-md hover:bg-white/[0.05] hover:text-white/70 transition-colors">
              Papers
            </a>
            <a href="#design" className="px-2.5 py-1 rounded-md hover:bg-white/[0.05] hover:text-white/70 transition-colors">
              Design
            </a>
            <a href="#contact" className="px-2.5 py-1 rounded-md hover:bg-white/[0.05] hover:text-white/70 transition-colors">
              Contact
            </a>
          </nav>
        </header>

        {/* Two Column Layout on Large Screens */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-4 pb-16">
          {/* Main Left Column (Projects, Pleiades, Design) */}
          <div className="lg:col-span-8 space-y-20">
            {/* Tier 1 — Personal projects */}
            <section id="projects" className="scroll-mt-8">
              <SectionHeader
                title="Projects"
                description="Main work outside Pleiades — currently Warmind."
              />
              {personalProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {personalProjects.map((project, i) => (
                    <ProjectCard
                      key={project.title}
                      {...project}
                      delay={i * 0.06}
                    />
                  ))}
                </div>
              ) : (
                <EmptyTier
                  message="No personal projects yet."
                  hint="Add entries in data/personal-projects.ts"
                />
              )}
            </section>

            <div className="section-rule" />

            {/* Tier 2 — Pleiades */}
            <section id="pleiades" className="scroll-mt-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
                <SectionHeader
                  title="Pleiades"
                  description="Product suite — Chat, Browse, Core Launcher, and Search."
                />
                <a
                  href={PLEIADES}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-[11px] font-mono uppercase tracking-[0.16em] text-white/35 hover:text-white/70 transition-colors sm:mb-1"
                >
                  Visit site →
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <ChatCard />
                <BrowseCard />
                <CoreCard />
                <SearchCard />
              </div>
            </section>

            <div className="section-rule" />

            {/* Tier 3 — Design work */}
            <section id="design" className="scroll-mt-8">
              <SectionHeader
                title="Design"
                description="UI concepts, game systems, and visual work."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {designWork.map((piece, i) => (
                  <DesignCard key={piece.title} {...piece} delay={i * 0.08} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Papers & Writing) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 space-y-8">
              <section id="papers" className="scroll-mt-8">
                <div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                    Blogs & Papers
                  </h2>
                </div>

                {/* Inline Search & Sort */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 mb-6">
                  <input
                    type="text"
                    placeholder="Search papers or tags..."
                    value={paperSearch}
                    onChange={(e) => setPaperSearch(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                  <select
                    value={paperSort}
                    onChange={(e) => setPaperSort(e.target.value as 'newest' | 'title')}
                    className="px-2.5 py-2 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 focus:outline-none cursor-pointer hover:text-white transition-colors"
                  >
                    <option value="newest" className="bg-[#0a0a0a]">Newest</option>
                    <option value="title" className="bg-[#0a0a0a]">A-Z</option>
                  </select>
                </div>

                <div className="space-y-4 mt-4">
                  {filteredPapers.length > 0 ? (
                    filteredPapers.map((paper, i) => (
                      <ConceptPaperCard
                        key={paper.id}
                        {...paper}
                        delay={i * 0.06}
                        onRead={(p) => setActivePaper(p)}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-xs text-white/30 font-mono">
                      No matching papers found.
                    </div>
                  )}
                </div>
              </section>

              <div className="section-rule lg:hidden" />

              {/* Contact Block in Right Column */}
              <section id="contact" className="scroll-mt-8 pt-4">
                <SectionHeader
                  title="Get in touch"
                  description="Open to work, collabs, and design chats."
                />
                <div className="space-y-3 mt-6">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="group block rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] p-5 hover:border-white/[0.14] transition-colors"
                  >
                    <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-white/30 mb-2">
                      Email
                    </p>
                    <p className="text-sm text-white/70 group-hover:text-white transition-colors break-all">
                      {EMAIL}
                    </p>
                  </a>
                  <div className="rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] p-5">
                    <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-white/30 mb-2">
                      Location
                    </p>
                    <p className="text-sm text-white/70">{LOCATION}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="w-full max-w-7xl mx-auto py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 text-[11px] text-gray-500 font-mono mt-4">
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            @{new Date().getFullYear()} Robert · GitHub
          </a>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span className="text-gray-600">{LOCATION}</span>
            <a
              href={`mailto:${EMAIL}`}
              className="hover:text-white transition-colors"
            >
              {EMAIL}
            </a>
            <a
              href={PLEIADES}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Pleiades
            </a>
          </div>
        </footer>
      </div>

      <PaperReaderModal
        open={Boolean(activePaper)}
        onClose={() => setActivePaper(null)}
        paper={activePaper}
      />
    </div>
  );
}

function EmptyTier({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-12 text-center">
      <p className="text-sm text-white/40 mb-1">{message}</p>
      <p className="text-[12px] font-mono text-white/25">{hint}</p>
    </div>
  );
}
