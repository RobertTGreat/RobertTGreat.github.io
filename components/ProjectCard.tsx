'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ExternalLink, Globe } from 'lucide-react';
import type { PersonalProject } from '@/data/personal-projects';

type ProjectCardProps = PersonalProject & {
  delay?: number;
};

export default function ProjectCard({
  title,
  description,
  tags,
  badge,
  image,
  previews,
  href,
  source,
  featured,
  delay = 0,
}: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [activePreview, setActivePreview] = useState(0);

  const hasGallery = Boolean(previews && previews.length > 0);
  const hasFeaturedMedia = hasGallery || Boolean(featured && image);

  const colSpan = hasGallery
    ? 'md:col-span-2 lg:col-span-3'
    : featured
      ? 'md:col-span-2 lg:col-span-2'
      : '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative h-full ${colSpan}`}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03] opacity-60 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

      <div
        className={`relative h-full rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.07] overflow-hidden backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.14] ${
          hasFeaturedMedia
            ? ''
            : 'flex flex-col p-5 sm:p-6'
        }`}
      >
        {hasGallery ? (
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] gap-0 min-h-[320px] lg:min-h-[380px]">
            <div className="flex flex-col justify-between p-7 sm:p-9 gap-8">
              <CardBody
                title={title}
                description={description}
                tags={tags}
                badge={badge}
                featured
                large
              />
              <CardActions href={href} source={source} />
            </div>

            <div className="relative border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-[#060606] overflow-hidden min-h-[240px] lg:min-h-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(0,210,255,0.06),transparent_55%)] pointer-events-none z-[1]" />

              {/* Fixed 16:9 stage — object-contain so previews never stretch */}
              <div className="relative w-full aspect-video max-h-full">
                {previews!.map((preview, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={preview.src}
                    src={preview.src}
                    alt={preview.alt}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
                      i === activePreview ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent pointer-events-none z-[1]" />

              <div className="absolute inset-x-0 bottom-0 z-[2] p-3 sm:p-4 flex gap-2">
                {previews!.map((preview, i) => (
                  <button
                    key={preview.src}
                    type="button"
                    onClick={() => setActivePreview(i)}
                    aria-label={`Show preview ${i + 1}`}
                    className={`relative flex-1 aspect-video rounded-md overflow-hidden border transition-all duration-300 cursor-pointer bg-black/40 ${
                      i === activePreview
                        ? 'border-white/30 ring-1 ring-white/20'
                        : 'border-white/[0.08] opacity-60 hover:opacity-90'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : featured && image ? (
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] min-h-[280px]">
            <div className="flex flex-col justify-between p-6 sm:p-8 gap-6">
              <CardBody
                title={title}
                description={description}
                tags={tags}
                badge={badge}
                featured
              />
              <CardActions href={href} source={source} />
            </div>
            <div className="relative border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-[#060606] overflow-hidden min-h-[200px]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(0,210,255,0.05),transparent_55%)] pointer-events-none z-[1]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${title} preview`}
                className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-[1]" />
            </div>
          </div>
        ) : (
          <>
            <CardBody
              title={title}
              description={description}
              tags={tags}
              badge={badge}
              image={image}
            />
            <div className="mt-auto pt-4">
              <CardActions href={href} source={source} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CardBody({
  title,
  description,
  tags,
  badge,
  image,
  featured,
  large,
}: {
  title: string;
  description: string;
  tags: string[];
  badge?: string;
  image?: string;
  featured?: boolean;
  large?: boolean;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        {image && !featured ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] transition-colors duration-300 group-hover:bg-white/[0.07] group-hover:border-white/[0.14]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <span className="font-display text-sm font-semibold text-white/50">
              {title.slice(0, 1)}
            </span>
          </div>
        )}
        {badge ? (
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-full uppercase tracking-widest shrink-0">
            {badge}
          </span>
        ) : null}
      </div>

      <h3
        className={`font-display font-semibold text-white tracking-wide mb-1.5 ${
          large
            ? 'text-2xl sm:text-3xl'
            : featured
              ? 'text-xl sm:text-2xl'
              : 'text-lg'
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-white/40 leading-relaxed font-light ${
          large || featured
            ? 'text-sm sm:text-[15px] max-w-md text-white/45'
            : 'text-[13px]'
        }`}
      >
        {description}
      </p>

      <div className={`flex flex-wrap gap-1.5 ${large ? 'mt-5' : 'mt-3'}`}>
        {tags.map((tag) => (
          <span
            key={tag}
            className={`font-mono text-white/30 border border-white/[0.06] rounded-md bg-white/[0.02] ${
              large
                ? 'px-2.5 py-1 text-[11px]'
                : 'px-2 py-0.5 text-[10px]'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function CardActions({
  href,
  source,
}: {
  href?: string;
  source?: string;
}) {
  if (!href && !source) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="white-shine-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/85 hover:text-white transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          Open Web
        </a>
      ) : null}
      {source ? (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white border border-white/[0.1] hover:border-white/[0.2] rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
        >
          Source
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : null}
    </div>
  );
}
