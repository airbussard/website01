import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt - Kostenloses Erstgespräch vereinbaren',
  description: 'Kontaktieren Sie uns für ein unverbindliches Erstgespräch. Wir beraten Sie zu Websites, Web-Apps und digitalen Lösungen für Ihr Unternehmen.',
  openGraph: {
    title: 'Kontakt - Kostenloses Erstgespräch vereinbaren',
    description: 'Kontaktieren Sie uns für ein unverbindliches Erstgespräch. Wir beraten Sie zu Websites, Web-Apps und digitalen Lösungen.',
    url: '/kontakt',
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
