import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Über uns - Oscar Knabe, Ihr Ansprechpartner',
  description: 'Lernen Sie Oscar Knabe kennen - Ihr persönlicher Ansprechpartner für alle digitalen Projekte. Über 10 Jahre Erfahrung in der Webentwicklung.',
  openGraph: {
    title: 'Über uns - Oscar Knabe, Ihr Ansprechpartner',
    description: 'Lernen Sie Oscar Knabe kennen - Ihr persönlicher Ansprechpartner für alle digitalen Projekte. Über 10 Jahre Erfahrung.',
    url: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
