/**
 * Design work section — gallery below Pleiades.
 * Drop images in public/ and list them here.
 */
export type DesignPiece = {
  title: string;
  description?: string;
  /** Single cover image */
  image?: string;
  /** Multi-image gallery with thumbnail strip */
  images?: { src: string; alt: string }[];
  href?: string;
  tags?: string[];
  /** Profile / ArtStation lead card */
  variant?: 'profile' | 'default';
};

export const ARTSTATION_URL = 'https://www.artstation.com/robertrobertson';

export const designWork: DesignPiece[] = [
  {
    title: 'Robert Robertson',
    description: 'Game UI · concept · product design on ArtStation.',
    image: '/fpfp.jpg',
    href: ARTSTATION_URL,
    tags: ['ArtStation'],
    variant: 'profile',
  },
  {
    title: 'Warmind',
    description:
      'UI and visual design for Warmind — Destiny 2 companion layout, inventory density, and dark celestial chrome.',
    images: [
      { src: '/warmind-1.png', alt: 'Warmind design 1' },
      { src: '/warmind-2.png', alt: 'Warmind design 2' },
      { src: '/warmind-3.png', alt: 'Warmind design 3' },
    ],
    href: 'https://warmind.app',
    tags: ['UI', 'Game companion', 'Destiny 2'],
  },
  {
    title: 'COD Zombies Standalone',
    description:
      'Concept for a dedicated Zombies experience — lobby, loadout, and match UI for the standalone game I’ve always wanted.',
    images: [
      { src: '/CODZ1.png', alt: 'COD Zombies design 1' },
      { src: '/CODZ2.png', alt: 'COD Zombies design 2' },
      { src: '/CODZ3.png', alt: 'COD Zombies design 3' },
      { src: '/CODZ4.png', alt: 'COD Zombies design 4' },
    ],
    tags: ['Concept', 'FPS', 'Zombies'],
  },
  {
    title: 'Game Library Skeleton',
    description:
      'Wireframe / skeleton for a game library — structure and hierarchy only, ready for skinning later.',
    images: [
      { src: '/GameLibrarySkeleton.png', alt: 'Game library skeleton' },
      {
        src: '/GameLibrarySkeleton-Lite.png',
        alt: 'Game library skeleton lite',
      },
    ],
    tags: ['Wireframe', 'Library', 'UX'],
  },
  {
    title: 'Futurist Game Menu',
    description:
      'Random cool futuristic MMO UI — main menu / hub exploration with high-energy sci-fi chrome.',
    image: '/GameMenuFuturistDesign.png',
    tags: ['MMO', 'Futuristic', 'Menu'],
  },
  {
    title: 'Card Game Design',
    description:
      'Layouts and card chrome for a solitaire monster-slaying card game — board, cards, and combat flow.',
    images: [
      { src: '/CardGameDesign-1.png', alt: 'Card game design 1' },
      { src: '/CardGameDesign-2.png', alt: 'Card game design 2' },
    ],
    tags: ['Cards', 'Solitaire', 'Monster slaying'],
  },
];
