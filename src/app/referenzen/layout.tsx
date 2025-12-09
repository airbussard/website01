import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referenzen & Projekte - Erfolgreiche Kundenprojekte',
  description: 'Ausgewählte Projekte: Websites, Web-Anwendungen und Mobile Apps. Sehen Sie, was wir für unsere Kunden entwickelt haben.',
  openGraph: {
    title: 'Referenzen & Projekte - Erfolgreiche Kundenprojekte',
    description: 'Ausgewählte Projekte: Websites, Web-Anwendungen und Mobile Apps. Sehen Sie, was wir für unsere Kunden entwickelt haben.',
    url: '/referenzen',
  },
};

export default function ReferenzenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
