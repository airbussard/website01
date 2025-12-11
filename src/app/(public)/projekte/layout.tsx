import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsere Projekte - Erfolgreiche Kundenprojekte',
  description: 'Ausgewählte Projekte: Websites, Web-Anwendungen und Mobile Apps. Sehen Sie, was wir für unsere Kunden entwickelt haben.',
  openGraph: {
    title: 'Unsere Projekte - Erfolgreiche Kundenprojekte',
    description: 'Ausgewählte Projekte: Websites, Web-Anwendungen und Mobile Apps. Sehen Sie, was wir für unsere Kunden entwickelt haben.',
    url: '/projekte',
  },
};

export default function ProjekteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
