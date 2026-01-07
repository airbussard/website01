# CLAUDE.md - KI-Assistenz Dokumentation

## 🎯 Projektübersicht

**Name:** getemergence.com Portfolio Website
**Zweck:** Professionelle Portfolio-Website für digitale Dienstleistungen und Software-Entwicklung
**Owner:** Oscar Knabe
**Live-URL:** oscarknabe.de (via CapRover)
**Repository:** https://github.com/airbussard/website01
**CapRover Webhook:** https://captain.immogear.de/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InRva2VuVmVyc2lvbiI6IjQ3ODYwMDY3LTQ3MDktNDJmMS1hZDIxLTRmNWQ2ZWFjZWJmZCIsImFwcE5hbWUiOiJ3ZWJzaXRlMDFvc2NhcmtuYWJlIiwibmFtZXNwYWNlIjoiY2FwdGFpbiJ9LCJpYXQiOjE3NTgxOTUzODJ9.mhObDqR-VkgYE0JPcVGL4e5Y6oHrN0rnVeQpZCqEJ-g

### Tech-Stack
- **Frontend:** Next.js 15.5.3 (App Router), TypeScript, Tailwind CSS 3.4, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Docker, CapRover, GitHub Actions
- **Development:** Node.js 20, npm

## 📁 Projektstruktur

```
website01/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── admin/              # Admin-Bereich
│   │   │   └── projects/       # Projektverwaltung
│   │   ├── project/[id]/       # Dynamische Projektdetails
│   │   ├── api/contact/        # Kontakt-API
│   │   ├── datenschutz/        # Datenschutzerklärung
│   │   ├── impressum/          # Impressum
│   │   ├── kontakt/            # Kontaktseite
│   │   ├── referenzen/         # Projektübersicht
│   │   ├── services/           # Dienstleistungen
│   │   ├── layout.tsx          # Root Layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Globale Styles
│   ├── components/
│   │   ├── admin/              # Admin-Komponenten
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ImageUploader.tsx
│   │   ├── About.tsx           # Über-uns Sektion
│   │   ├── Contact.tsx         # Kontaktformular
│   │   ├── Footer.tsx          # Footer
│   │   ├── Header.tsx          # Navigation
│   │   ├── Hero.tsx            # Hero-Sektion
│   │   ├── ImageGallery.tsx    # Bildergalerie
│   │   ├── Projects.tsx        # Projekt-Showcase
│   │   └── Technologies.tsx    # Tech-Stack Display
│   ├── lib/
│   │   ├── supabase/           # Supabase Client
│   │   └── hooks/              # Custom React Hooks
│   └── types/                  # TypeScript Definitionen
├── public/                     # Statische Assets
├── .env.local.example          # Umgebungsvariablen Template
├── Dockerfile                  # Docker Container
├── captain-definition          # CapRover Config
├── next.config.ts              # Next.js Konfiguration
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind Konfiguration
├── tsconfig.json               # TypeScript Config
└── SUPABASE_SETUP.md          # Supabase Anleitung
```

## 🏗️ Architektur

### Datenmodell (Supabase)

```sql
-- Projekte
projects:
  - id (uuid, primary key)
  - title (text)
  - description (text)
  - long_description (text)
  - category ('web' | 'mobile' | 'system')
  - technologies (text[])
  - live_url (text)
  - github_url (text)
  - featured (boolean)
  - display_order (integer)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Projekt-Bilder
project_images:
  - id (uuid, primary key)
  - project_id (uuid, foreign key)
  - image_url (text)
  - thumbnail_url (text)
  - caption (text)
  - alt_text (text)
  - is_primary (boolean)
  - display_order (integer)
  - created_at (timestamp)

-- Kontaktanfragen
contact_requests:
  - id (uuid, primary key)
  - name (text)
  - email (text)
  - company (text)
  - subject (text)
  - message (text)
  - project_type (text)
  - created_at (timestamp)
```

### Wichtige Komponenten

1. **Header.tsx** - Responsive Navigation mit Mobile Menu
2. **Projects.tsx** - Dynamische Projektanzeige aus Supabase
3. **Contact.tsx** - Kontaktformular mit Supabase Integration
4. **Admin Dashboard** - Geschützter Bereich für Projektverwaltung
5. **ImageUploader.tsx** - Drag & Drop Bildupload mit Supabase Storage

## 🚀 Entwicklung

### Lokale Entwicklung starten

```bash
# Dependencies installieren
npm install

# Umgebungsvariablen einrichten
cp .env.local.example .env.local
# Editiere .env.local mit deinen Supabase Credentials

# Development Server starten
npm run dev

# Build für Production
npm run build

# Production Server starten
npm start
```

### Wichtige Befehle

```bash
npm run dev          # Entwicklungsserver auf http://localhost:3000
npm run build        # Production Build erstellen
npm run lint         # ESLint ausführen
npm run typecheck    # TypeScript Typ-Prüfung (wenn eingerichtet)
```

### Umgebungsvariablen

Erstelle eine `.env.local` Datei:

```env
# Supabase (erforderlich für volle Funktionalität)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key (optional)

# Die App funktioniert auch ohne Supabase mit Mock-Daten
```

## 🌟 Features

### Öffentliche Website
- **Homepage** - Hero, Services, Projekte, Über uns, Kontakt
- **Projektdetails** - Detailseite mit Bildergalerie
- **Services** - Interaktive Dienstleistungsübersicht
- **Referenzen** - Gefilterte Projektgalerie
- **Kontakt** - Formular mit Supabase-Speicherung
- **Impressum & Datenschutz** - Rechtliche Seiten

### Admin-Bereich (/admin/projects)
- Supabase Auth Login
- CRUD für Projekte
- Bildupload und -verwaltung
- Drag & Drop Support
- Primärbild-Auswahl

### Design Features
- Vollständig responsive (Mobile-First)
- Dark/Light Mode Support
- Smooth Scroll Navigation
- Framer Motion Animationen
- Optimierte Bilder mit Next.js Image

## 🐛 Bekannte Probleme & Lösungen

### TypeScript Build Fehler
**Problem:** `display_order` Property fehlt im Project Type
**Lösung:** Property wurde zum Interface hinzugefügt

### Supabase Build Fehler
**Problem:** Build schlägt ohne Supabase ENV-Variablen fehl
**Lösung:** Fallback-Werte in `src/lib/supabase/client.ts` implementiert

### Tailwind CSS v4 Inkompatibilität
**Problem:** PostCSS Fehler mit Tailwind v4
**Lösung:** Downgrade auf Tailwind CSS v3.4

## 📦 Deployment

### CapRover Deployment

```bash
# Automatisch via GitHub Push
git add .
git commit -m "Deine Änderungen"
git push origin main

# CapRover holt automatisch von GitHub und deployed
```

### Docker Build

```bash
# Lokal testen
docker build -t website01 .
docker run -p 3000:3000 website01
```

### Wichtige Deployment-Dateien
- `Dockerfile` - Multi-stage Build mit Node.js Alpine
- `captain-definition` - CapRover Konfiguration
- `.dockerignore` - Ausgeschlossene Dateien

## 🔧 Wartung

### Dependency Updates

```bash
# Prüfe auf Updates
npm outdated

# Update Dependencies (vorsichtig!)
npm update

# Major Updates (sehr vorsichtig!)
npm install package@latest
```

### Datenbank-Backup
- Supabase Dashboard → Settings → Backups
- Regelmäßige Exports empfohlen

### Monitoring
- CapRover Dashboard für Container-Status
- Supabase Dashboard für API-Nutzung
- GitHub Actions für Build-Status

## 📝 Code-Konventionen

### TypeScript
- Strikte Type-Definitionen verwenden
- Interfaces über Types bevorzugen
- Keine `any` Types ohne Kommentar

### React/Next.js
- Funktionale Komponenten mit Hooks
- 'use client' nur wenn nötig
- Server Components bevorzugen

### Styling
- Tailwind CSS Utility-First
- Keine inline Styles
- Dark Mode immer berücksichtigen

### Git Commits
```
feat: Neue Feature
fix: Bugfix
docs: Dokumentation
style: Formatierung
refactor: Code-Refactoring
test: Tests
chore: Wartung
```

## 🔒 Sicherheit

- Alle API-Keys in Umgebungsvariablen
- Supabase RLS (Row Level Security) aktiviert
- HTTPS nur (via CapRover)
- Input-Validierung im Kontaktformular
- SQL Injection Prevention durch Supabase

## 📞 Support & Kontakt

**Entwickler:** Oscar Knabe
**Adresse:** Steinstraße 71, 52249 Eschweiler
**E-Mail:** info@dev.tech
**Website:** oscarknabe.de

## 🚨 Wichtige Hinweise für KI-Assistenten

1. **Immer Deutsch verwenden** bei Kommunikation mit dem User
2. **Keine Emojis** außer explizit gewünscht
3. **Build testen** nach Änderungen: `npm run build`
4. **Supabase Fallback** - App funktioniert auch ohne Supabase Config
5. **Admin-Bereich** benötigt Supabase Auth
6. **Bilder** werden in Supabase Storage gespeichert
7. **CapRover** deployed automatisch von GitHub main branch
8. **WICHTIG: Nach jeder Änderung committen und deployen:**
   ```bash
   git add . && git commit -m "Beschreibung" && git push origin main
   curl -X POST "https://captain.immogear.de/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InRva2VuVmVyc2lvbiI6IjQ3ODYwMDY3LTQ3MDktNDJmMS1hZDIxLTRmNWQ2ZWFjZWJmZCIsImFwcE5hbWUiOiJ3ZWJzaXRlMDFvc2NhcmtuYWJlIiwibmFtZXNwYWNlIjoiY2FwdGFpbiJ9LCJpYXQiOjE3NTgxOTUzODJ9.mhObDqR-VkgYE0JPcVGL4e5Y6oHrN0rnVeQpZCqEJ-g"
   ```

## 📚 Weiterführende Dokumentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [CapRover Docs](https://caprover.com/docs)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detaillierte Supabase-Anleitung

---

*Letzte Aktualisierung: Oktober 2024*
*Version: 1.0.0*