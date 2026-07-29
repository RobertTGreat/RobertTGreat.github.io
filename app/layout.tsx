import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Robert — Portfolio',
  description:
    'Personal projects, Pleiades products, and design work. Software, tools, and visual craft.',
  authors: [{ name: 'Robert' }],
  openGraph: {
    title: 'Robert — Portfolio',
    description:
      'Personal projects, Pleiades products, and design work.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#010101] text-gray-200">
        {children}
      </body>
    </html>
  );
}
