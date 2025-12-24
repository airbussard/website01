import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webdesign für Rechtsanwälte & Kanzleien | DSGVO-konforme Kanzlei-Websites',
  description: 'Professionelle Kanzlei-Websites für Rechtsanwälte. DSGVO-konform, mit Online-Terminbuchung & Mandanten-Portal. Seriös, vertrauenswürdig, rechtssicher.',
  keywords: 'webdesign rechtsanwälte, kanzlei website, anwalt homepage, rechtsanwalt webdesign, mandantenportal, online terminbuchung anwalt, dsgvo konform, anwaltswebsite, kanzlei homepage',
  openGraph: {
    title: 'Webdesign für Rechtsanwälte & Kanzleien',
    description: 'Professionelle Kanzlei-Websites: DSGVO-konform, mit Mandanten-Portal & Online-Terminbuchung.',
    type: 'website',
  },
};

export default function WebdesignRechtsanwaelteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
