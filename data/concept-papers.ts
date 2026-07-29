export type ConceptPaper = {
  id: string;
  type?: 'paper' | 'blog';
  title: string;
  subtitle?: string;
  description: string;
  fileUrl: string;
  tags: string[];
  readTime: string;
  date?: string;
  featured?: boolean;
};

export const conceptPapers: ConceptPaper[] = [
  {
    id: 'universal-rich-presence',
    type: 'paper',
    title: 'Universal Rich Presence (ULP)',
    subtitle: 'Open-Standard Cross-Platform Rich Presence Architecture',
    description:
      'Client-agnostic protocol layer designed to decouple application status generation from proprietary platforms, enabling multi-target status broadcasting across open-source clients.',
    fileUrl: '/UniversalRichPresence.md',
    tags: [
      'Rich Presence',
      'IPC Bus',
      'Open Standard',
      'Protocol Design',
      'Pleiades Architecture',
    ],
    readTime: '6 min read',
    date: '2026',
    featured: true,
  },
  {
    id: 'ashen-edge',
    type: 'paper',
    title: 'Ashen Edge',
    subtitle: 'Technical Architecture & Systemic Design Manual',
    description:
      'Deterministic, dark fantasy single-player directional combat system engineered around spatial mechanics, continuous physical collision verification, and strict input agency.',
    fileUrl: '/AshenEdge.md',
    tags: [
      'Spatial Physics',
      'Swept Collision',
      'Systemic Design',
      'Combat Architecture',
      'Frame Pacing',
    ],
    readTime: '12 min read',
    date: '2026',
    featured: true,
  },
];
