import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webdesign für Ärzte & Praxen | Barrierefreie Praxis-Websites',
  description: 'Moderne Praxis-Websites für Ärzte und Zahnärzte. Barrierefrei, mit Online-Terminbuchung & Patientenportal. Medizinische Compliance garantiert.',
  keywords: 'webdesign ärzte, praxis website, arzt homepage, zahnarzt webdesign, patientenportal, online terminbuchung praxis, barrierefreie website, praxis software',
  openGraph: {
    title: 'Webdesign für Ärzte & Praxen',
    description: 'Moderne Praxis-Websites: Barrierefrei, mit Patientenportal & Online-Terminbuchung.',
    type: 'website',
  },
};

export default function WebdesignAerzteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
