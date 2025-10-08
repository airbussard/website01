import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'log-k-flugbuch',
    title: 'Log-K - Digitales Pilotenflugbuch (iOS & Web)',
    description: 'EASA/FAA konformes digitales Flugbuch - Native iOS App mit vollwertigem Web-Dashboard',
    longDescription: `Ein umfassendes digitales Flugbuch-System für Piloten mit vollständiger EASA/FAA Compliance auf zwei Plattformen.

Das System bietet sowohl eine native iOS-App als auch ein vollwertiges Web-Dashboard, die nahtlos über Supabase synchronisiert werden.

**iOS App (Native Swift/SwiftUI):**
- Offline-fähige native Performance
- Apple Sign-In Integration
- EASA/FAA konformes Flugbuch
- Flottenverwaltung mit detaillierten Flugzeugdaten
- Crew-Verwaltung und Besatzungszuordnung
- Profilverwaltung mit Lizenzen und Ratings
- Automatische Backup-Funktionen
- PDF-Export für Behörden

**Web-Dashboard (PHP/Supabase):**
- Voller Funktionsumfang wie iOS App
- CRUD-Operationen für Flüge, Flugzeuge und Crew
- Interaktives Dashboard mit Statistiken und Charts
- Filter- und Export-Funktionen
- Responsive Design für Desktop und Tablet
- Row Level Security (RLS) für Datenisolierung
- Sichere Authentifizierung über Supabase Auth

Technische Highlights:
- Echtzeit-Synchronisation zwischen iOS und Web
- Soft-Delete-Implementierung für Datenintegrität
- PostgreSQL Datenbank mit optimierten Queries
- Umfangreiche Backup-Funktionen
- Multi-Plattform-Architektur mit gemeinsamer Datenbasis

Das System ist speziell für Berufspiloten entwickelt und erfüllt alle behördlichen Anforderungen für EASA und FAA.`,
    categories: ['web', 'mobile', 'system'],
    technologies: ['Swift', 'SwiftUI', 'PHP', 'Supabase', 'PostgreSQL', 'Apple Sign-In', 'PDF Generation', 'Responsive Web'],
    imageUrl: '/images/projects/logk/logk_web.png',
    images: [
      '/images/projects/logk/logk_web.png',
      '/images/projects/logk/logk_web_02.png',
      '/images/projects/logk/logk_ios_01.png',
      '/images/projects/logk/logk_ios_02.png',
    ],
    liveUrl: 'https://log-k.flighthour.de',
    githubUrl: '',
    featured: true,
    createdAt: '2024-07-10',
    display_order: 1,
  },
  {
    id: 'immogear-app',
    title: 'ImmoGear - Immobilienverwaltung (iOS & Web)',
    description: 'Professionelle Immobilienverwaltung - Native iOS App mit umfangreichem Web-Portal',
    longDescription: `Eine professionelle Immobilienverwaltungslösung für Vermieter und Hausverwalter auf zwei Plattformen.

Das System bietet sowohl eine native iOS-App für mobilen Zugriff als auch ein vollwertiges Web-Portal für die Verwaltung am Desktop.

**iOS App (Native SwiftUI):**
- Offline-fähige native Performance
- Immobilienübersicht mit allen verwalteten Objekten
- Mieterverwaltung mit Vertragsdetails
- Zahlungsübersicht und Mietzahlungsstatus
- Aufgabenverwaltung für Wartungen und To-Dos
- Dokumentenverwaltung pro Immobilie
- Zählerstandsverwaltung für Nebenkostenabrechnungen
- MVVM Architecture Pattern
- Vollständig auf Deutsch lokalisiert

**Web-Portal (Hauptsystem):**
- Vollständige CRUD-Operationen für alle Daten
- Immobilien-, Mieter- und Vertragsverwaltung
- Finanzübersichten und Reporting
- Dokumentenmanagement mit Upload
- Kalender für Termine und Fristen
- Responsive Design für Desktop und Tablet
- Mehrbenutzerverwaltung mit Rollen

Technische Architektur:
- Native Swift/SwiftUI für iOS
- Modern Web-Stack für das Portal
- Supabase Backend mit PostgreSQL
- Echtzeit-Synchronisation zwischen Plattformen
- Row Level Security (RLS) für Datenisolierung
- Async/Await für asynchrone Operationen

Besonderheit:
Die iOS App arbeitet im Read-Only Modus für mobile Übersicht, während das Web-Portal die vollständige Verwaltung ermöglicht.`,
    categories: ['web', 'mobile', 'system'],
    technologies: ['Swift', 'SwiftUI', 'Supabase', 'PostgreSQL', 'MVVM', 'Async/Await', 'Responsive Web'],
    imageUrl: '/images/projects/immogear/immogear_web_01.png',
    images: [
      '/images/projects/immogear/immogear_web_01.png',
      '/images/projects/immogear/immogear_web_02.png',
    ],
    liveUrl: 'https://immogear.de',
    githubUrl: '',
    featured: true,
    createdAt: '2024-07-23',
    display_order: 2,
  },
  {
    id: 'flighthour-portal',
    title: 'FLIGHTHOUR Employee Portal',
    description: 'Umfassendes Mitarbeiterportal mit Ticketsystem, Dokumentenmanagement und Kalenderintegration',
    longDescription: `Ein modernes Mitarbeiterportal für Luftfahrtunternehmen mit umfangreichen Management-Funktionen.

Das System existiert in zwei Implementierungen:
- Moderne Next.js 14 Version mit TypeScript
- Legacy PHP-Version für Strato-Hosting-Kompatibilität

Hauptfunktionen:
- Ticket-System für Support-Anfragen
- Dokumentenmanagement mit Berechtigungssystem
- Google Calendar Integration
- E-Mail-Integration mit IMAP
- Benutzer- und Rollenverwaltung
- Dashboard mit Statistiken

Technische Architektur:
- Next.js 14 mit App Router
- TypeScript, Tailwind CSS, shadcn/ui
- Supabase Backend mit PostgreSQL
- Row Level Security (RLS) für sichere Datenisolierung
- Email Worker für automatische Ticket-Erstellung
- OAuth2 für Google Calendar Sync

Rollen-System:
- Employee: Basis-Zugriff
- Manager: Erweiterte Berechtigungen
- Admin: Volle System-Kontrolle

Die Plattform wurde speziell für die Anforderungen in der Luftfahrtbranche entwickelt.`,
    categories: ['web'],
    technologies: ['Next.js', 'TypeScript', 'PHP', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'shadcn/ui', 'Google Calendar API'],
    imageUrl: '/images/projects/flighthour.jpg',
    liveUrl: 'https://portal.flighthour.de',
    githubUrl: '',
    featured: true,
    createdAt: '2024-07-29',
    display_order: 3,
  },
  {
    id: 'eventhour-platform',
    title: 'EventHour - Erlebnisportal',
    description: 'Umfassende E-Commerce-Plattform für Erlebnisse und Gutscheine mit Monorepo-Architektur',
    longDescription: `Eine moderne, skalierbare Plattform für den Verkauf von Erlebnissen und Gutscheinen mit Multi-App-Architektur.

Das System basiert auf einem Turborepo-Monorepo mit drei separaten Anwendungen und wiederverwendbaren Packages.

Architektur:
- **Kundenportal (Web)**: Hauptwebsite für Endkunden
- **Admin-Dashboard**: Verwaltung von Erlebnissen, Partnern und Bestellungen
- **Partner-Portal**: Selbstverwaltung für Erlebnisanbieter

Shared Packages:
- @eventhour/ui - Wiederverwendbare UI-Komponenten
- @eventhour/database - Prisma Schema und Datenbank-Utils
- @eventhour/auth - Zentrale Authentifizierungs-Logik
- @eventhour/payments - Payment-Provider (Stripe Integration)
- @eventhour/consent - DSGVO Cookie-Management

Hauptfunktionen:
- Erlebnisverwaltung mit Kategorien und Filtern
- Gutscheinsystem mit QR-Codes
- Bestellmanagement mit E-Mail-Benachrichtigungen
- Bildupload mit Drag & Drop
- Rolle-basierte Zugriffskontrolle
- Stripe Payment Integration
- Responsive Design mit EventHour Branding (Gelb/Schwarz)
- E-Mail-Bestätigung bei Registrierung

Technische Highlights:
- ~26.000 Zeilen TypeScript Code
- Turborepo für optimiertes Monorepo-Management
- Next.js 14 mit App Router
- Supabase Backend mit Row Level Security
- Framer Motion für Animationen
- ITC Avant Garde Gothic + Poppins Typography
- Automatisiertes Deployment via Docker/CapRover

Die Plattform ist vollständig produktionsreif und skalierbar für größere Nutzermengen.`,
    categories: ['web'],
    technologies: ['Next.js', 'TypeScript', 'Turborepo', 'Supabase', 'PostgreSQL', 'Stripe', 'Tailwind CSS', 'Framer Motion', 'Prisma'],
    imageUrl: '/images/projects/eventhour/eventhour_01.png',
    images: [
      '/images/projects/eventhour/eventhour_01.png',
      '/images/projects/eventhour/eventhour_02.png',
      '/images/projects/eventhour/eventhour_03.png',
    ],
    liveUrl: 'https://flighthourlandingp.immogear.de',
    githubUrl: 'https://github.com/airbussard/flighthour-landing-pages',
    featured: true,
    createdAt: '2024-09-11',
    display_order: 4,
  },
  {
    id: 'michaelaknabe-art',
    title: 'Michaela Knabe - Künstlerportfolio',
    description: 'Elegante Portfolio-Website für Künstlerin mit Galerie und Admin-Bereich',
    longDescription: `Eine moderne, minimalistische Portfolio-Website für die Künstlerin Michaela Knabe.

Die Website präsentiert Kunstwerke in einer eleganten, benutzerfreundlichen Galerie mit vollständigem Admin-Backend.

Features:
- Responsive Hero-Section mit Künstler-Vorstellung
- Galerie mit Grid-Layout für Kunstwerke
- Über-Seite mit Künstler-Biografie
- Admin-Bereich für Content-Management
- Kontaktformular mit E-Mail-Integration
- Google reCAPTCHA v3 für Spam-Schutz
- Vollständig mehrsprachig (next-intl)
- DSGVO-konforme Datenschutzseiten

Design:
- Minimalistisches, elegantes Design
- Optimiert für Kunstpräsentation
- Perfekte Darstellung auf allen Geräten
- Schnelle Ladezeiten durch Next.js Optimierung

Tech Stack:
- Next.js 15 mit App Router
- TypeScript für Type-Safety
- Supabase für Backend und Bildverwaltung
- Tailwind CSS 4 für Styling
- Responsive Design für alle Bildschirmgrößen

Die Website setzt den Fokus auf die Kunst und bietet eine störungsfreie Präsentation der Werke.`,
    categories: ['web'],
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'next-intl', 'reCAPTCHA', 'React Hook Form'],
    imageUrl: '/images/projects/michaelaknabe.jpg',
    liveUrl: 'https://michaelaknabe.de',
    githubUrl: '',
    featured: false,
    createdAt: '2024-09-06',
    display_order: 5,
  },
  {
    id: 'teppichhaus-website',
    title: 'Teppichhaus am Dornbusch',
    description: 'Moderne Website für Teppichhaus mit Service-Seiten und Kontaktformular',
    longDescription: `Eine professionelle Next.js Website für das Teppichhaus am Dornbusch in Frankfurt am Main.

Die Website präsentiert alle Services des Unternehmens und ermöglicht einfache Kontaktaufnahme.

Features:
- Ansprechende Homepage mit Hero-Section
- Service-Seiten für alle Angebote:
  - Teppich-Verkauf
  - Teppich-Ankauf
  - Professionelle Teppichreinigung
  - Teppichreparatur mit Vorher/Nachher-Slider
- Kontaktformular mit E-Mail-Integration
- Google Maps Integration für Standort
- DSGVO-konformes Cookie-Consent-Tool
- Rechtliche Seiten (Impressum, Datenschutz, AGB)

Technische Highlights:
- Automatisches Deployment über GitHub Actions
- CapRover-Integration für einfaches Hosting
- SMTP-E-Mail-Integration für Kontaktanfragen
- Responsive Design für alle Geräte
- SEO-optimiert für lokale Suche

Deployment:
- Automatisiertes CI/CD über GitHub Actions
- CapRover für Container-Orchestrierung
- Umgebungsvariablen für sichere Konfiguration

Die Website ist speziell auf die Bedürfnisse eines lokalen Einzelhandelsgeschäfts zugeschnitten.`,
    categories: ['web'],
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Nodemailer', 'Google Maps API', 'CapRover', 'Docker'],
    imageUrl: '/images/projects/teppichhaus.jpg',
    liveUrl: 'https://teppichhaus-am-dornbusch.de',
    githubUrl: '',
    featured: false,
    createdAt: '2024-10-05',
    display_order: 6,
  },
];

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(project => project.id === id);
}

// Helper function to get projects by category
export function getProjectsByCategory(category: 'web' | 'mobile' | 'system' | 'all'): Project[] {
  if (category === 'all') return projects;
  return projects.filter(project => project.categories.includes(category));
}

// Helper function to get featured projects
export function getFeaturedProjects(): Project[] {
  return projects.filter(project => project.featured);
}
