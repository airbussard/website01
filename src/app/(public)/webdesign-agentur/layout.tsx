import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webdesign Agentur | Professionelle Webagentur für Ihre Website',
  description: 'Ihre Webdesign Agentur für professionelle Websites. Full Service Webagentur mit SEO, responsive Webdesign & Webentwicklung. Jetzt kostenloses Erstgespräch!',
  keywords: 'webdesign agentur, webagentur, digitalagentur, internetagentur, website erstellen lassen, webentwicklung agentur, responsive webdesign, homepage erstellen lassen, barrierefreies webdesign, seo agentur',
  openGraph: {
    title: 'Webdesign Agentur | Professionelle Webagentur',
    description: 'Ihre Webdesign Agentur für professionelle Websites. Full Service Webagentur mit SEO, responsive Webdesign & Webentwicklung.',
    type: 'website',
  },
};

export default function WebdesignAgenturLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
