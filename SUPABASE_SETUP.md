# Supabase Setup für dev.tech Portfolio

## 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir die Project URL und Anon Key

## 2. Umgebungsvariablen konfigurieren

Kopiere `.env.local.example` zu `.env.local` und füge deine Werte ein:

```bash
cp .env.local.example .env.local
```

Füge folgende Werte ein:
```
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key (optional für Admin)
```

## 3. Datenbank-Schema einrichten

1. Gehe zu SQL Editor in Supabase Dashboard
2. Führe das SQL-Script aus `supabase-schema.sql` aus
3. Das erstellt:
   - `projects` Tabelle für Projekte
   - `project_images` Tabelle für Bilder
   - `contact_requests` Tabelle für Kontaktanfragen
   - Storage Bucket `project-images` für Bilder
   - Notwendige RLS Policies

## 4. Authentication einrichten (für Admin)

1. Gehe zu Authentication > Users
2. Erstelle einen neuen User mit E-Mail und Passwort
3. Diese Credentials verwendest du für `/admin/projects` Login

## 5. Storage konfigurieren

Der Storage Bucket `project-images` wird automatisch erstellt.
Falls nicht:

1. Gehe zu Storage in Supabase
2. Erstelle einen neuen Bucket namens `project-images`
3. Setze ihn auf Public

## 6. Projekte verwalten

### Option A: Über Supabase Dashboard
1. Gehe zu Table Editor
2. Wähle `projects` Tabelle
3. Füge Projekte hinzu

### Option B: Über Admin Interface (empfohlen)
1. Gehe zu `https://deine-domain.com/admin/projects`
2. Logge dich mit deinen Supabase Auth Credentials ein
3. Verwalte Projekte und lade Bilder hoch

## 7. Projekt-Struktur

### Projects Tabelle
- `id`: UUID (auto-generated)
- `title`: Projektname
- `description`: Kurzbeschreibung
- `long_description`: Detaillierte Beschreibung
- `category`: 'web' | 'mobile' | 'system'
- `technologies`: Array von Technologien
- `live_url`: Link zur Live-Version
- `github_url`: GitHub Repository
- `featured`: Boolean für Featured-Projekte
- `display_order`: Reihenfolge der Anzeige

### Project Images
- Mehrere Bilder pro Projekt möglich
- Primärbild wird in Übersicht angezeigt
- Galerie in Detailansicht

## 8. Troubleshooting

### Projekte werden nicht angezeigt
- Prüfe ob Umgebungsvariablen gesetzt sind
- Prüfe ob Datenbank-Schema erstellt wurde
- Schaue in Browser-Konsole nach Fehlern

### Bilder werden nicht hochgeladen
- Prüfe Storage Bucket Permissions
- Stelle sicher dass User authentifiziert ist
- Prüfe Dateigrößen-Limits in Supabase

### Admin Login funktioniert nicht
- Erstelle User in Supabase Authentication
- Verwende korrekte E-Mail/Passwort
- Prüfe ob RLS Policies korrekt sind

## Beispiel-Daten

Füge diese Beispieldaten in die `projects` Tabelle ein:

```sql
INSERT INTO projects (title, description, category, technologies, featured)
VALUES
  ('E-Commerce Platform', 'Moderne Shopping-Lösung', 'web',
   ARRAY['React', 'Node.js', 'PostgreSQL'], true),
  ('iOS Fitness App', 'Fitness-Tracking App', 'mobile',
   ARRAY['Swift', 'SwiftUI', 'HealthKit'], true),
  ('CRM System', 'Kundenmanagement-System', 'system',
   ARRAY['Next.js', 'TypeScript', 'Prisma'], false);
```