# dev.tech Portfolio Website

Eine moderne, professionelle Portfolio-Website für digitale Dienstleistungen und Software-Entwicklung.

## 🚀 Quick Start

```bash
# Dependencies installieren
npm install

# Umgebungsvariablen einrichten (optional für Supabase)
cp .env.local.example .env.local

# Development Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## 📋 Features

- ✅ Responsive Design (Mobile-First)
- ✅ Dark/Light Mode
- ✅ Projektgalerie mit Filterung
- ✅ Admin-Dashboard für Inhaltsverwaltung
- ✅ Kontaktformular mit Datenbank-Speicherung
- ✅ Bildupload und -verwaltung
- ✅ SEO-optimiert
- ✅ Performance-optimiert

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.3 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Animationen:** Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Docker, CapRover

## 📁 Projektstruktur

```
src/
├── app/          # Next.js App Router Pages
├── components/   # React Components
├── lib/          # Utilities & Hooks
└── types/        # TypeScript Types
```

## 🔧 Konfiguration

### Umgebungsvariablen

Erstelle eine `.env.local` Datei:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Hinweis:** Die App funktioniert auch ohne Supabase-Konfiguration mit Mock-Daten.

## 📦 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t dev-tech .
docker run -p 3000:3000 dev-tech
```

### CapRover

Push zu GitHub main branch deployed automatisch via CapRover.

## 📚 Dokumentation

- [CLAUDE.md](./CLAUDE.md) - Ausführliche technische Dokumentation
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase Einrichtung

## 👤 Kontakt

**Oscar Knabe**
Steinstraße 71, 52249 Eschweiler
[oscarknabe.de](https://oscarknabe.de)

## 📄 Lizenz

© 2024 dev.tech - Alle Rechte vorbehalten