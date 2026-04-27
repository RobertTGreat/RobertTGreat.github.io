import Image from "next/image";

type ProjectLink = {
  label: string;
  url: string;
};

type PortfolioProject = {
  name: string;
  category: string;
  description: string;
  previewImage: string;
  techStack: string[];
  highlights: string[];
  links: ProjectLink[];
};

const portfolioProjects: PortfolioProject[] = [
  {
    name: "Warmind",
    category: "Destiny 2 companion",
    description:
      "A minimalist Destiny 2 companion app created from the need to bring gear, vault, clan, activity, and progression workflows into one cleaner place.",
    previewImage: "/project-previews/warmind.png",
    techStack: ["Next.js", "React", "TypeScript", "CSS", "Google Cloud"],
    highlights: [
      "Inventory and vault management surfaces",
      "Activity and progression tracking",
      "Responsive companion-app interface",
    ],
    links: [{ label: "Live site", url: "https://www.warmind.app/" }],
  },
  {
    name: "Eorzea Command",
    category: "FFXIV desktop companion",
    description:
      "A Windows-first Final Fantasy XIV command center built to reduce the friction of scattered plugins and websites by collecting character context, checklists, collections, market tools, reset planning, and optional analytics in one local app.",
    previewImage: "/project-previews/eorzea.png",
    techStack: ["TypeScript", "Tauri", "SQLite", "CSS", "GitHub Actions"],
    highlights: [
      "Desktop installer flow from the web download page",
      "Local-first data model for characters, goals, and cached game data",
      "Universalis market lookup and release-based updater pipeline",
    ],
    links: [
      { label: "Download page", url: "https://eorzea.warmind.app/" },
      { label: "GitHub", url: "https://github.com/RobertTGreat/Eorzea" },
    ],
  },
  {
    name: "Pleiades",
    category: "Real-time social platform",
    description:
      "A real-time social platform created to explore whether the pain points of Discord-style communities could be improved with servers, direct messages, global feeds, LFG, news, and events.",
    previewImage: "/project-previews/pleiades.png",
    techStack: ["Next.js", "React", "TypeScript", "Realtime data", "CSS"],
    highlights: [
      "Server-based community structure",
      "Direct messaging and global feed experiences",
      "Event, news, and LFG coordination features",
    ],
    links: [{ label: "Live site", url: "https://www.pleiades.chat/" }],
  },
  {
    name: "Repacked",
    category: "Second-hand marketplace",
    description:
      "A university resale marketplace project with authenticated listings, search, filtering, image uploads, cart flows, and real-time updates.",
    previewImage: "/project-previews/repacked.png",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
    highlights: [
      "Supabase auth, database, storage, and real-time sync",
      "Post creation, editing, image upload, search, and filtering",
      "Frosted glass marketplace UI with responsive layouts",
    ],
    links: [
      { label: "Live site", url: "https://repacked.shop/" },
      { label: "GitHub", url: "https://github.com/RobertTGreat/vile" },
    ],
  },
];

const knownTechnologies = [
  "CSS",
  "HTML",
  "Java",
  "JavaScript",
  "Python",
  "PHP",
  "TypeScript",
  "Google Cloud",
  "Next.js",
  "Node.js",
  "React",
  "Firebase",
  "Supabase",
  "SpacetimeDB",
  "MySQL",
  "Figma",
  "Git",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <a className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400" href="#">
            Robert Robertson
          </a>
          <nav className="flex items-center gap-5 text-sm text-zinc-400">
            <a className="transition hover:text-white" href="#stack">
              Stack
            </a>
            <a className="transition hover:text-white" href="#projects">
              Projects
            </a>
          </nav>
        </header>

        <section className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-2" id="stack">
          <div>
            <h1 className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Overall stack
            </h1>
            <div className="flex flex-wrap gap-2">
              {knownTechnologies.map((technology) => (
                <span
                  className="border border-white/10 bg-white/[0.025] px-3 py-2 text-sm text-zinc-300"
                  key={technology}
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              About me
            </h2>
            <p className="max-w-3xl text-base leading-8 text-zinc-300">
              My personal projects usually start from practical frustration: I want one place to
              manage a game, community, workflow, or marketplace without bouncing through scattered
              tools. Warmind and Eorzea Command came from wanting better companion experiences for
              games I care about, Pleiades came from testing how community platforms could avoid
              familiar Discord pain points, and Repacked came from a university marketplace brief.
            </p>
          </div>
        </section>

        <section id="projects" className="grid gap-5 xl:grid-cols-2">
          {portfolioProjects.map((project) => (
            <article
              className="grid overflow-hidden border border-white/10 bg-white/[0.025]"
              key={project.name}
            >
              <a
                className="group relative block aspect-[16/10] overflow-hidden bg-zinc-950"
                href={project.links[0].url}
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt={`${project.name} page preview captured with Puppeteer`}
                  className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  fill
                  sizes="(min-width: 1280px) 50vw, 100vw"
                  src={project.previewImage}
                />
              </a>
              <div className="flex flex-col gap-7 p-6 sm:p-8">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {project.category}
                  </p>
                  <h2 className="text-3xl font-semibold text-white">{project.name}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                    {project.description}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Tech stack</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.techStack.map((technology) => (
                        <span
                          className="border border-white/10 bg-white/[0.035] px-3 py-1 text-sm text-zinc-300"
                          key={technology}
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Details</h3>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-zinc-400">
                      {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  {project.links.map((link) => (
                    <a
                      className="border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/35 hover:bg-white/10"
                      href={link.url}
                      key={link.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-zinc-500">
          Robert Robetson
        </footer>
      </section>
    </main>
  );
}
