import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technologien - Next.js, React, Swift & mehr',
  description: 'Moderne Technologien für zukunftssichere Lösungen: Next.js, React, TypeScript, Swift, Supabase und mehr.',
  openGraph: {
    title: 'Technologien - Next.js, React, Swift & mehr',
    description: 'Moderne Technologien für zukunftssichere Lösungen: Next.js, React, TypeScript, Swift, Supabase und mehr.',
    url: '/tech',
  },
};

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
