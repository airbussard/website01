# SYSTEM-DOCS.md - Vollständige Systemdokumentation

**Projekt:** getemergence.com Portfolio & Projektmanagement
**Autor:** Oscar Knabe
**Stand:** Dezember 2024

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Datenbank-Schema](#2-datenbank-schema)
3. [Backend/Dashboard-System](#3-backenddashboard-system)
4. [Öffentliche Website](#4-öffentliche-website)
5. [Rollen & Berechtigungen](#5-rollen--berechtigungen)

---

## 1. Projektübersicht

### 1.1 Tech-Stack

| Bereich | Technologie | Version |
|---------|-------------|---------|
| Frontend | Next.js (App Router) | 15.5.3 |
| UI Framework | React | 19.1.0 |
| Sprache | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.17 |
| Animationen | Framer Motion | 12.23.14 |
| Icons | Lucide React | 0.544.0 |
| Forms | React Hook Form | 7.62.0 |
| Backend | Supabase | 2.57.4 |
| Email | Nodemailer | 7.0.11 |
| Deployment | Docker + CapRover | - |

### 1.2 URLs & Deployment

| Umgebung | URL |
|----------|-----|
| **Live** | https://oscarknabe.de |
| **Supabase** | Supabase Cloud |
| **CapRover** | captain.immogear.de |
| **GitHub** | github.com/airbussard/website01 |

### 1.3 Projektstruktur

```
website01/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Öffentliche Seiten
│   │   ├── api/                # API Routes
│   │   ├── auth/               # Auth Pages
│   │   └── dashboard/          # Dashboard Pages
│   ├── components/             # React Komponenten
│   │   ├── admin/              # Admin-Komponenten
│   │   ├── contracts/          # Vertrags-Komponenten
│   │   └── dashboard/          # Dashboard-Komponenten
│   ├── contexts/               # React Contexts
│   ├── lib/                    # Libraries & Services
│   │   ├── supabase/           # Supabase Clients
│   │   └── services/           # Business Logic
│   └── types/                  # TypeScript Definitionen
├── supabase/
│   └── migrations/             # SQL Migrationen
└── public/                     # Statische Assets
```

---

## 2. Datenbank-Schema

### 2.1 Tabellen-Übersicht

Das System verwendet 18 Tabellen in Supabase (PostgreSQL):

| Tabelle | Zweck | RLS |
|---------|-------|-----|
| `profiles` | Benutzerprofile | Ja |
| `projects` | Öffentliche Portfolio-Projekte | Ja |
| `project_images` | Bilder zu Portfolio-Projekten | Ja |
| `contact_requests` | Kontaktformular-Einträge | Ja |
| `email_messages` | Nachrichten zu Kontaktanfragen | Ja |
| `email_settings` | SMTP/IMAP Konfiguration | Ja |
| `email_queue` | E-Mail-Warteschlange | Ja |
| `pm_projects` | Kundenprojekte (PM-System) | Ja |
| `project_members` | Projektmitglieder | Ja |
| `tasks` | Aufgaben/Tickets | Ja |
| `comments` | Kommentare (polymorf) | Ja |
| `progress_updates` | Fortschrittsupdates | Ja |
| `project_files` | Datei-Metadaten | Ja |
| `invoices` | Rechnungen | Ja |
| `contracts` | Verträge mit Signatur | Ja |
| `activity_log` | Aktivitätsprotokoll | Ja |

### 2.2 Detailliertes Schema

#### profiles
```sql
id              UUID PRIMARY KEY  -- FK: auth.users(id)
email           TEXT NOT NULL
full_name       TEXT
first_name      TEXT
last_name       TEXT
avatar_url      TEXT
role            TEXT DEFAULT 'user'  -- 'user' | 'manager' | 'admin'
company         TEXT
phone           TEXT
mobile          TEXT
-- Privatadresse
street          TEXT
postal_code     TEXT
city            TEXT
country         TEXT DEFAULT 'Deutschland'
-- Firmenadresse
company_street        TEXT
company_postal_code   TEXT
company_city          TEXT
company_country       TEXT DEFAULT 'Deutschland'
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### pm_projects (Kundenprojekte)
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
description     TEXT
status          TEXT DEFAULT 'active'
                -- 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
priority        TEXT DEFAULT 'medium'
                -- 'low' | 'medium' | 'high' | 'critical'
client_id       UUID FK → profiles(id)
manager_id      UUID FK → profiles(id)
start_date      DATE
due_date        DATE
completed_at    TIMESTAMPTZ
budget          DECIMAL(10,2)
budget_used     DECIMAL(10,2) DEFAULT 0
settings        JSONB DEFAULT '{}'
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### tasks
```sql
id              UUID PRIMARY KEY
project_id      UUID FK → pm_projects(id) CASCADE
title           TEXT NOT NULL
description     TEXT
status          TEXT DEFAULT 'backlog'
                -- 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
priority        TEXT DEFAULT 'medium'
assignee_id     UUID FK → profiles(id)
created_by      UUID FK → profiles(id)
parent_task_id  UUID FK → tasks(id)  -- Self-reference
due_date        DATE
start_date      DATE
completed_at    TIMESTAMPTZ
estimated_hours DECIMAL(6,2)
actual_hours    DECIMAL(6,2) DEFAULT 0
position        INTEGER DEFAULT 0
tags            TEXT[] DEFAULT '{}'
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### contracts
```sql
id                  UUID PRIMARY KEY
project_id          UUID FK → pm_projects(id) CASCADE
title               TEXT NOT NULL
description         TEXT
status              TEXT DEFAULT 'pending_signature'
                    -- 'pending_signature' | 'signed' | 'expired' | 'cancelled'
original_pdf_path   TEXT NOT NULL
original_pdf_url    TEXT
signed_pdf_path     TEXT
signed_pdf_url      TEXT
signature_data      TEXT          -- Base64 Signatur
signed_at           TIMESTAMPTZ
signed_by           UUID FK → profiles(id)
signer_ip           TEXT
signer_user_agent   TEXT
valid_until         DATE
created_by          UUID FK → profiles(id)
created_at          TIMESTAMPTZ DEFAULT NOW()
updated_at          TIMESTAMPTZ DEFAULT NOW()
```

#### contact_requests
```sql
id              UUID PRIMARY KEY
ticket_number   INTEGER         -- Auto-increment via Sequence
name            TEXT NOT NULL
email           TEXT NOT NULL
company         TEXT
subject         TEXT NOT NULL
message         TEXT NOT NULL
project_type    TEXT
status          TEXT DEFAULT 'neu'
                -- 'neu' | 'in_bearbeitung' | 'erledigt'
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### email_queue
```sql
id                  UUID PRIMARY KEY
contact_request_id  UUID FK → contact_requests(id)
recipient_email     TEXT NOT NULL
recipient_name      TEXT
subject             TEXT NOT NULL
content_html        TEXT NOT NULL
content_text        TEXT
status              TEXT DEFAULT 'pending'
                    -- 'pending' | 'processing' | 'sent' | 'failed'
type                TEXT DEFAULT 'notification'
                    -- 'notification' | 'contact' | 'system' | 'reply'
attempts            INTEGER DEFAULT 0
max_attempts        INTEGER DEFAULT 3
last_attempt_at     TIMESTAMPTZ
error_message       TEXT
sent_at             TIMESTAMPTZ
metadata            JSONB DEFAULT '{}'
created_at          TIMESTAMPTZ DEFAULT NOW()
```

#### activity_log
```sql
id              UUID PRIMARY KEY
project_id      UUID FK → pm_projects(id)
task_id         UUID FK → tasks(id)
user_id         UUID FK → profiles(id)
action          TEXT  -- 'created' | 'updated' | 'deleted' | 'commented' | ...
entity_type     TEXT  -- 'project' | 'task' | 'contract' | 'invoice' | ...
entity_id       UUID
details         JSONB DEFAULT '{}'
old_value       JSONB
new_value       JSONB
ip_address      INET
user_agent      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### 2.3 RLS-Policies (Row Level Security)

#### Helper-Funktionen
```sql
get_user_role()        -- Gibt aktuelle Benutzerrolle zurück
is_admin()             -- TRUE wenn Admin
is_manager_or_admin()  -- TRUE wenn Manager oder Admin
has_project_access(project_id)  -- TRUE wenn Zugriff auf Projekt
```

#### Zugriffs-Logik
- **profiles**: Eigenes Profil oder Manager/Admin
- **pm_projects**: Client, Manager oder Projektmitglied
- **tasks**: Nur mit Projekt-Zugriff
- **contracts**: Nur mit Projekt-Zugriff
- **contact_requests**: INSERT öffentlich, Rest nur Service-Role
- **email_***: Nur Service-Role

### 2.4 Trigger & Funktionen

| Trigger | Tabelle | Funktion |
|---------|---------|----------|
| `on_auth_user_created` | auth.users | `handle_new_user()` - Erstellt Profil |
| `update_*_updated_at` | Diverse | Aktualisiert `updated_at` |
| `update_full_name` | profiles | Kombiniert first_name + last_name |

### 2.5 Storage Buckets

| Bucket | Sichtbarkeit | Zweck |
|--------|--------------|-------|
| `project-images` | Öffentlich | Portfolio-Bilder |
| `project_files` | Privat | Projekt-Dateien, PDFs, Verträge |

---

## 3. Backend/Dashboard-System

### 3.1 Authentifizierung

#### AuthContext (`src/contexts/AuthContext.tsx`)

Zentrale Auth-State-Verwaltung für die gesamte App:

```typescript
interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;              // 'user' | 'manager' | 'admin'
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isManagerOrAdmin: boolean;
  signIn(email, password): Promise<{ error: string | null }>;
  signUp(email, password, fullName?): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
  refreshProfile(): Promise<void>;
}
```

**Features:**
- Singleton Supabase-Client
- 10s Timeout für Auth-Operationen
- Automatische Session-Erneuerung
- Profil-Laden aus `profiles`-Tabelle

#### Middleware (`src/middleware.ts`)

Schützt Routes und prüft Berechtigungen:

| Route-Pattern | Schutz |
|---------------|--------|
| `/dashboard/*` | Login erforderlich |
| `/dashboard/admin/*` | Admin-Rolle erforderlich |
| `/auth/*` | Redirect zu Dashboard wenn eingeloggt |

### 3.2 Supabase-Clients

#### Browser-Client (`src/lib/supabase/client.ts`)
- Verwendung: Client-Komponenten
- Respektiert RLS-Policies
- Singleton-Pattern

#### Server-Client (`src/lib/supabase/server.ts`)
- Verwendung: Server Components, API Routes
- Cookie-Management
- Respektiert RLS-Policies

#### Admin-Client (`src/lib/supabase/admin.ts`)
- Verwendung: Nur Backend-Operationen
- **Umgeht alle RLS-Policies**
- Service-Role-Key erforderlich

### 3.3 API-Routes

#### Öffentliche Endpoints

| Methode | Route | Zweck |
|---------|-------|-------|
| POST | `/api/contact` | Kontaktformular absenden |

#### Auth-geschützte Endpoints

| Methode | Route | Zweck | Rolle |
|---------|-------|-------|-------|
| GET | `/api/contracts` | Verträge auflisten | User+ |
| POST | `/api/contracts` | Vertrag erstellen | Manager+ |
| GET | `/api/contracts/[id]` | Vertrag laden | User+ |
| PATCH | `/api/contracts/[id]` | Vertrag aktualisieren | Manager+ |
| DELETE | `/api/contracts/[id]` | Vertrag löschen | Admin |
| POST | `/api/contracts/[id]/sign` | Vertrag unterschreiben | User+ |

#### Admin-Endpoints

| Methode | Route | Zweck |
|---------|-------|-------|
| GET | `/api/admin/users` | Alle Benutzer laden |
| POST | `/api/admin/users/invite` | Benutzer einladen |
| PATCH | `/api/admin/users/[id]` | Profil aktualisieren |
| DELETE | `/api/admin/users/[id]` | Benutzer löschen |
| POST | `/api/admin/users/[id]/reset-password` | Passwort-Reset |
| POST | `/api/admin/users/[id]/magic-link` | Magic-Link senden |
| GET | `/api/admin/activity` | Aktivitäts-Log |
| GET | `/api/admin/anfragen` | Kontaktanfragen |
| GET | `/api/admin/anfragen/[id]` | Anfrage-Details |
| DELETE | `/api/admin/anfragen/[id]` | Anfrage löschen |
| PATCH | `/api/admin/anfragen/[id]/status` | Status ändern |
| POST | `/api/admin/anfragen/[id]/reply` | Antwort senden |
| PATCH | `/api/admin/anfragen/[id]/notes` | Notizen aktualisieren |
| GET | `/api/admin/email-settings` | E-Mail-Einstellungen |
| PUT | `/api/admin/email-settings` | Einstellungen aktualisieren |
| POST | `/api/admin/email-settings` | SMTP-Test |
| GET | `/api/admin/email-queue` | E-Mail-Queue |
| PATCH | `/api/admin/email-queue/[id]` | Queue-Item aktualisieren |

#### Cron-Endpoints

| Route | Zweck |
|-------|-------|
| GET `/api/cron/process-email-queue` | E-Mail-Queue verarbeiten |

### 3.4 Dashboard-Seiten

| Route | Seite | Berechtigung |
|-------|-------|--------------|
| `/dashboard` | Dashboard-Übersicht | User+ |
| `/dashboard/projects` | Projekt-Liste | User+ |
| `/dashboard/projects/[id]` | Projekt-Details | User+ |
| `/dashboard/projects/new` | Neues Projekt | Manager+ |
| `/dashboard/tasks` | Aufgaben-Liste | User+ |
| `/dashboard/tasks/[id]` | Aufgaben-Details | User+ |
| `/dashboard/contracts` | Verträge | User+ |
| `/dashboard/contracts/[id]` | Vertrags-Details | User+ |
| `/dashboard/invoices` | Rechnungen | User+ |
| `/dashboard/profile` | Eigenes Profil | User+ |
| `/dashboard/activity` | Aktivitäts-Log | Manager+ |
| `/dashboard/admin/users` | Nutzerverwaltung | Admin |
| `/dashboard/admin/anfragen` | Kontaktanfragen | Manager+ |
| `/dashboard/admin/email` | E-Mail-Verwaltung | Admin |
| `/dashboard/admin/settings` | Admin-Einstellungen | Admin |

### 3.5 Services

#### ContactService (`src/lib/services/contact/ContactService.ts`)
```typescript
static getAll(): Promise<ContactRequest[]>
static getById(id): Promise<ContactRequest | null>
static getByStatus(status): Promise<ContactRequest[]>
static getStats(): Promise<ContactStats>
static updateStatus(id, status): Promise<boolean>
static createMessage(data): Promise<EmailMessage | null>
static getMessages(requestId): Promise<EmailMessage[]>
static delete(id): Promise<boolean>
```

#### EmailService (`src/lib/services/email/EmailService.ts`)
```typescript
static getSettings(): Promise<EmailSettings | null>
static updateSettings(settings): Promise<boolean>
static queueEmail(item): Promise<EmailQueueItem | null>
static getQueueItems(filter): Promise<EmailQueueItem[]>
static getQueueStats(): Promise<QueueStats>
static claimPendingEmails(limit): Promise<EmailQueueItem[]>
static resetStuckProcessingEmails(minutes): Promise<number>
```

### 3.6 Dashboard-Komponenten

| Komponente | Datei | Zweck |
|------------|-------|-------|
| `DashboardLayout` | `components/dashboard/DashboardLayout.tsx` | Layout-Container |
| `DashboardSidebar` | `components/dashboard/DashboardSidebar.tsx` | Navigation |
| `DashboardHeader` | `components/dashboard/DashboardHeader.tsx` | Top-Bar |
| `InviteUserModal` | `components/admin/InviteUserModal.tsx` | Benutzer einladen |
| `UserEditModal` | `components/admin/UserEditModal.tsx` | Profil bearbeiten |
| `UserActionsMenu` | `components/admin/UserActionsMenu.tsx` | Aktions-Dropdown |
| `ContractUploadModal` | `components/contracts/ContractUploadModal.tsx` | Vertrag hochladen |
| `ContractSigningDialog` | `components/contracts/ContractSigningDialog.tsx` | Unterschrift |
| `SignatureCanvas` | `components/contracts/SignatureCanvas.tsx` | Unterschrift-Canvas |

---

## 4. Öffentliche Website

### 4.1 Seiten-Struktur

| Route | Seite | Beschreibung |
|-------|-------|--------------|
| `/` | Homepage | Hero, USPs, Services, Projekte, CTA |
| `/services` | Dienstleistungen | 4 Service-Kategorien mit Details |
| `/projekte` | Projektgalerie | Filterbare Projekt-Übersicht |
| `/technologien` | Tech-Stack | Expertise und Technologien |
| `/ueber-uns` | Über uns | Team und Werte |
| `/kontakt` | Kontakt | Formular, Map, FAQ |
| `/project/[id]` | Projekt-Details | Einzelnes Projekt |
| `/impressum` | Impressum | Rechtliche Infos |
| `/datenschutz` | Datenschutz | DSGVO-Erklärung |
| `/cookie-policy` | Cookie-Richtlinie | Cookie-Details |

### 4.2 Homepage-Sektionen

1. **Hero** - Headline, Trust-Badges, CTAs
2. **Vorteile (USPs)** - 4 Benefit-Cards
3. **Zielgruppen** - Für wen wir arbeiten
4. **Leistungen** - 4 Service-Teaser
5. **Prozess** - 4 Schritte der Zusammenarbeit
6. **Featured Projects** - 3 ausgewählte Projekte
7. **Testimonials** - Kundenmeinungen
8. **CTA Section** - Abschluss-Call-to-Action

### 4.3 Hauptkomponenten

| Komponente | Datei | Zweck |
|------------|-------|-------|
| `Header` | `components/Header.tsx` | Navigation mit Mobile-Menu |
| `Footer` | `components/Footer.tsx` | Footer mit Links |
| `Hero` | `components/Hero.tsx` | Hero-Section |
| `Contact` | `components/Contact.tsx` | Kontaktformular |
| `ProjectCard` | `components/ProjectCard.tsx` | Projekt-Karte |
| `ImageGallery` | `components/ImageGallery.tsx` | Bildergalerie mit Lightbox |
| `Testimonials` | `components/Testimonials.tsx` | Kundenmeinungen |
| `CookieConsent` | `components/CookieConsent.tsx` | Cookie-Banner |
| `ScrollToTop` | `components/ScrollToTop.tsx` | Scroll-Button |

### 4.4 Styling-System

#### Tailwind-Konfiguration
```typescript
// tailwind.config.ts
colors: {
  primary: {
    50: '#f0f9ff',
    // ...
    600: '#0284c7',  // Hauptfarbe
    // ...
    950: '#082f49'
  }
}

fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace']
}
```

#### Globale Styles (`globals.css`)
```css
/* Blob-Animation für Hero */
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
```

### 4.5 SEO & Metadata

#### Robots & Sitemap
```
robots.txt:
  Allow: /
  Disallow: /admin/
  Sitemap: https://oscarknabe.de/sitemap.xml

sitemap.xml:
  / (priority: 1)
  /services (0.9)
  /projekte (0.8)
  /kontakt (0.8)
  ...
```

#### JSON-LD Structured Data
- OrganizationJsonLd
- LocalBusinessJsonLd
- WebsiteJsonLd
- BreadcrumbJsonLd (Detail-Seiten)

#### Open Graph
```
og:type: website
og:locale: de_DE
og:image: /og-image.jpg (1200x630)
```

### 4.6 Animationen (Framer Motion)

Standard-Pattern für Komponenten:
```typescript
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
viewport={{ once: true }}
```

---

## 5. Rollen & Berechtigungen

### 5.1 Rollen-Übersicht

| Rolle | Beschreibung | Anzahl |
|-------|--------------|--------|
| `user` | Standard-Benutzer (Kunden) | Unbegrenzt |
| `manager` | Projekt-Manager | Wenige |
| `admin` | Administrator | 1-2 |

### 5.2 Berechtigungs-Matrix

| Funktion | User | Manager | Admin |
|----------|:----:|:-------:|:-----:|
| **Projekte** |
| Eigene Projekte sehen | ✅ | ✅ | ✅ |
| Alle Projekte sehen | ❌ | ✅ | ✅ |
| Projekte erstellen | ❌ | ✅ | ✅ |
| Projekte bearbeiten | ❌ | ✅ | ✅ |
| **Aufgaben** |
| Zugewiesene Tasks sehen | ✅ | ✅ | ✅ |
| Tasks erstellen | ❌ | ✅ | ✅ |
| Tasks bearbeiten | ⚠️* | ✅ | ✅ |
| **Verträge** |
| Eigene Verträge sehen | ✅ | ✅ | ✅ |
| Verträge unterschreiben | ✅ | ✅ | ✅ |
| Verträge hochladen | ❌ | ✅ | ✅ |
| Verträge löschen | ❌ | ❌ | ✅ |
| **Admin** |
| Nutzerverwaltung | ❌ | ❌ | ✅ |
| E-Mail-Einstellungen | ❌ | ❌ | ✅ |
| Kontaktanfragen | ❌ | ✅ | ✅ |
| Aktivitäts-Log | ❌ | ✅ | ✅ |

*⚠️ = Nur wenn als Assignee zugewiesen

### 5.3 Implementierung

**Frontend (AuthContext):**
```typescript
const { isAdmin, isManager, isManagerOrAdmin } = useAuth();

// Conditional Rendering
{isAdmin && <AdminSection />}
{isManagerOrAdmin && <ManagerSection />}
```

**Backend (API Routes):**
```typescript
// Rolle prüfen
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
}
```

**Datenbank (RLS):**
```sql
CREATE POLICY "manager_or_admin_only" ON pm_projects
  FOR INSERT
  USING (is_manager_or_admin());
```

---

## Anhang

### A. Migrationen

| Datei | Zweck |
|-------|-------|
| `001_pm_schema.sql` | Basis-Schema (PM-System) |
| `002_rls_policies.sql` | RLS-Policies |
| `003_storage_buckets.sql` | Storage-Konfiguration |
| `20241212_email_system.sql` | E-Mail-System |
| `20241212_contact_system.sql` | Kontakt-Erweiterung |
| `20241212_profile_extended.sql` | Profil-Erweiterung |
| `20241213_contracts.sql` | Vertrags-System |
| `20241213_fix_user_trigger.sql` | User-Trigger Fix |

### B. Environment Variables

```env
# Supabase (erforderlich)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://oscarknabe.de
```

### C. TypeScript-Typen

Wichtige Typdefinitionen in:
- `src/types/index.ts` - Portfolio-Typen
- `src/types/dashboard.ts` - PM-System-Typen
- `src/types/contact.ts` - Kontakt-Typen
- `src/types/email.ts` - E-Mail-Typen

---

*Letzte Aktualisierung: Dezember 2024*
