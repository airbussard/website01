import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leistungen - Websites, Web-Apps & Mobile Apps',
  description: 'Von der einfachen Website bis zur komplexen Web-Anwendung. Individuelle Digitallösungen für Handwerker, Dienstleister und Mittelstand.',
  openGraph: {
    title: 'Leistungen - Websites, Web-Apps & Mobile Apps',
    description: 'Von der einfachen Website bis zur komplexen Web-Anwendung. Individuelle Digitallösungen für Handwerker, Dienstleister und Mittelstand.',
    url: '/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
