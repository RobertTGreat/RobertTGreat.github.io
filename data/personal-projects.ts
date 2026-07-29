/**
 * Personal projects shown at the top of the portfolio.
 * Add / edit entries here — they render automatically.
 */
export type PersonalProject = {
  title: string;
  description: string;
  tags: string[];
  /** Optional badge (version, status) */
  badge?: string;
  /** Single image path under /public, or remote URL */
  image?: string;
  /**
   * Multi-preview gallery (e.g. warmind-1.png … warmind-3.png).
   * When set, the card uses the large featured layout with thumbnails.
   */
  previews?: { src: string; alt: string }[];
  /** Live site */
  href?: string;
  /** Source repo */
  source?: string;
  /** Featured wide card (spans 2 cols on large screens; full width with previews) */
  featured?: boolean;
};

export const personalProjects: PersonalProject[] = [
  {
    title: 'Warmind',
    description:
      'Destiny 2 companion — inventory, loadouts, vendors, triumphs, and activity history with a dense, game-native UI.',
    tags: ['Next.js', 'Bungie API', 'TypeScript'],
    badge: 'Live',
    href: 'https://warmind.app',
    source: 'https://github.com/RobertTGreat/Warmind',
    featured: true,
    previews: [
      { src: '/warmind-1.png', alt: 'Warmind preview 1' },
      { src: '/warmind-2.png', alt: 'Warmind preview 2' },
      { src: '/warmind-3.png', alt: 'Warmind preview 3' },
    ],
  },
];
