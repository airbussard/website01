import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'log-k-flugbuch',
    title: 'Log-K - Digitales Pilotenflugbuch',
    description: 'EASA/FAA konformes digitales Flugbuch als native iOS App mit Web-Dashboard',
    longDescription: `Ein umfassendes digitales Flugbuch-System für Piloten mit vollständiger EASA/FAA Compliance.

Das System besteht aus einer nativen iOS-App und einem modernen Web-Dashboard, die nahtlos über Supabase synchronisiert werden.

Hauptmerkmale:
- Native iOS App in Swift/SwiftUI
- EASA/FAA konformes Flugbuch mit PDF-Export
- Flottenverwaltung mit detaillierten Flugzeugdaten
- Crew-Verwaltung und Besatzungszuordnung
- Dashboard mit umfangreichen Statistiken und Charts
- Profilverwaltung mit Lizenzen und Ratings
- Automatische Backup-Funktionen
- Apple Sign-In Integration
- Row Level Security (RLS) für Datenisolierung

Technische Highlights:
- Native Swift/SwiftUI für iOS
- Web-Dashboard in PHP mit Supabase Backend
- Echtzeit-Synchronisation zwischen App und Web
- Soft-Delete-Implementierung für Datenintegrität
- Umfangreiche Filter- und Export-Funktionen
- Sichere Authentifizierung über Supabase Auth

Die App ist speziell für Berufspiloten entwickelt und erfüllt alle behördlichen Anforderungen.`,
    category: 'mobile',
    technologies: ['Swift', 'SwiftUI', 'PHP', 'Supabase', 'PostgreSQL', 'Apple Sign-In', 'PDF Generation'],
    imageUrl: '/images/projects/log-k.jpg',
    liveUrl: 'https://log-k.flighthour.de',
    githubUrl: '',
    featured: true,
    createdAt: '2024-07-10',
    display_order: 1,
  },
  {
    id: 'immogear-app',
    title: 'ImmoGear - Immobilienverwaltung',
    description: 'Native iOS App für Vermieter und Hausverwalter zur effizienten Immobilienverwaltung',
    longDescription: `Eine professionelle iOS-App für Vermieter, Hausverwalter und Immobilieneigentümer zur Verwaltung ihrer Objekte.

Die App bietet einen umfassenden Überblick über alle verwalteten Immobilien mit Read-Only Zugriff auf das zentrale System.

Features:
- Immobilienübersicht mit allen verwalteten Objekten
- Mieterverwaltung mit Vertragsdetails
- Zahlungsübersicht und Mietzahlungsstatus
- Aufgabenverwaltung für Wartungen und To-Dos
- Dokumentenverwaltung pro Immobilie
- Zählerstandsverwaltung für Nebenkostenabrechnungen
- Synchronisation mit Web-Portal

Architektur:
- Native SwiftUI für optimale Performance
- MVVM Architecture Pattern
- Supabase als Backend (Read-Only)
- Async/Await für asynchrone Operationen
- Vollständig auf Deutsch lokalisiert

Besonderheit:
Die App arbeitet im Read-Only Modus, um Datenkonflikte zu vermeiden. Alle Änderungen erfolgen über das Web-Portal.`,
    category: 'mobile',
    technologies: ['Swift', 'SwiftUI', 'Supabase', 'MVVM', 'Async/Await'],
    imageUrl: '/images/projects/immogear.jpg',
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
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'PHP', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'shadcn/ui', 'Google Calendar API'],
    imageUrl: '/images/projects/flighthour.jpg',
    liveUrl: 'https://portal.flighthour.de',
    githubUrl: '',
    featured: true,
    createdAt: '2024-07-29',
    display_order: 3,
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
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'next-intl', 'reCAPTCHA', 'React Hook Form'],
    imageUrl: '/images/projects/michaelaknabe.jpg',
    liveUrl: 'https://michaelaknabe.de',
    githubUrl: '',
    featured: false,
    createdAt: '2024-09-06',
    display_order: 4,
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
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Nodemailer', 'Google Maps API', 'CapRover', 'Docker'],
    imageUrl: '/images/projects/teppichhaus.jpg',
    liveUrl: 'https://teppichhaus-am-dornbusch.de',
    githubUrl: '',
    featured: false,
    createdAt: '2024-10-05',
    display_order: 5,
  },
  {
    id: 'jvc-kalender',
    title: 'jVC Kalender & Verfügbarkeitsmanagement',
    description: 'Jugendverband-Terminverwaltung mit Verfügbarkeitskalender und ICS-Export',
    longDescription: `Ein spezialisiertes Kalendersystem für den Jugendverband jVC zur Verwaltung von Terminen und Verfügbarkeiten.

Das System ermöglicht effiziente Terminplanung unter Berücksichtigung von Urlauben und Verfügbarkeiten aller Mitglieder.

Hauptfunktionen:
- Gemeinsamer Kalender für alle Termine
- Verfügbarkeitskalender mit Overlay-Funktion
- Urlaubsverwaltung (mehrere Zeiträume pro Person)
- F-Tage (Freie Tage) Verwaltung
- ICS-Export für iPhone/Mac/Google Calendar
- Zeitraum-basierter Export von Terminen
- Automatische Einladungsmails bei Account-Erstellung

Rollen-System:
- **Normal**: Eigene Verfügbarkeit verwalten, Termine ansehen
- **Moderator**: Termine erstellen und verwalten
- **Administrator**: Vollständige Nutzerverwaltung

Technische Features:
- React Big Calendar für intuitive Darstellung
- ICS-Format-Export für Kalender-Kompatibilität
- Realtime-Updates mit Supabase
- E-Mail-Integration für Benachrichtigungen
- Verfügbarkeits-Overlay im Kalender
- Responsive Design für alle Geräte

Die Plattform wurde speziell für die Bedürfnisse von Jugendverbänden entwickelt.`,
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'React Big Calendar', 'ICS Export', 'Tailwind CSS'],
    imageUrl: '/images/projects/jvc.jpg',
    liveUrl: 'https://kalender.jvc-online.de',
    githubUrl: 'https://github.com/airbussard/jvc',
    featured: false,
    createdAt: '2025-10-03',
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
  return projects.filter(project => project.category === category);
}

// Helper function to get featured projects
export function getFeaturedProjects(): Project[] {
  return projects.filter(project => project.featured);
}
