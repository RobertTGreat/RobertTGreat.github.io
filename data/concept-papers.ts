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
