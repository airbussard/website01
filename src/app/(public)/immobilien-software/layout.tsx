import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Immobilien-Software für Makler | All-in-One Maklersystem',
  description: 'Komplette Immobilien-Software für Makler. Objektverwaltung, Exposé-Generator, Anfrage-Management & CRM. Standard-Paket + individuelle Erweiterungen.',
  keywords: 'immobilien software, maklersoftware, immobilienverwaltung, exposé generator, makler crm, anfrage management, immobilienmakler software, objektverwaltung',
  openGraph: {
    title: 'Immobilien-Software für Makler',
    description: 'All-in-One Maklersystem: Objektverwaltung, Exposé-Generator, CRM & Anfrage-Management.',
    type: 'website',
  },
};

export default function ImmobilienSoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
