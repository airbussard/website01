-- =====================================================
-- PROJEKTMANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Dieses Schema erweitert die bestehende Datenbank um
-- ein vollständiges Projektmanagement-System.
-- =====================================================

-- =====================================================
-- 1. PROFILES (Benutzerprofile mit Rollen)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin')),
  company TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger für automatische Profil-Erstellung bei User-Registrierung
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger nur erstellen wenn nicht existiert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 2. PM_PROJECTS (Kundenprojekte)
-- =====================================================
CREATE TABLE IF NOT EXISTS pm_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Beziehungen
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Termine
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Budget
  budget DECIMAL(10,2),
  budget_used DECIMAL(10,2) DEFAULT 0,

  -- Metadaten
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_pm_projects_client ON pm_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_pm_projects_manager ON pm_projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_pm_projects_status ON pm_projects(status);

-- =====================================================
-- 3. PROJECT_MEMBERS (Projektmitglieder)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- =====================================================
-- 4. TASKS (Aufgaben)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,

  -- Inhalt
  title TEXT NOT NULL,
  description TEXT,

  -- Status & Priorität
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Beziehungen
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Termine
  due_date DATE,
  start_date DATE,
  completed_at TIMESTAMPTZ,

  -- Zeit-Tracking
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2) DEFAULT 0,

  -- Sortierung
  position INTEGER DEFAULT 0,

  -- Metadaten
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(project_id, status, position);

-- =====================================================
-- 5. COMMENTS (Kommentare)
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphe Beziehung
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES pm_projects(id) ON DELETE CASCADE,

  -- Inhalt
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Antworten
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Metadaten
  is_internal BOOLEAN DEFAULT FALSE, -- Nur für Manager/Admin sichtbar
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Mindestens task_id ODER project_id muss gesetzt sein
  CONSTRAINT comment_target CHECK (task_id IS NOT NULL OR project_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- =====================================================
-- 6. PROGRESS_UPDATES (Fortschrittsupdates)
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Inhalt
  title TEXT NOT NULL,
  content TEXT,

  -- Fortschritt
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Autor
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Anhänge (Bilder etc.)
  images JSONB DEFAULT '[]', -- Array von {url, caption, uploaded_at}
  attachments JSONB DEFAULT '[]',

  -- Sichtbarkeit
  is_public BOOLEAN DEFAULT TRUE, -- Für Kunden sichtbar

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_updates_project ON progress_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_task ON progress_updates(task_id);

-- =====================================================
-- 7. INVOICES (Rechnungen)
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,

  -- Rechnungsdaten
  invoice_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,

  -- Beträge
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

  -- Termine
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,

  -- PDF
  pdf_url TEXT,

  -- Metadaten
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- =====================================================
-- 8. ACTIVITY_LOG (Aktivitätsprotokoll)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Beziehungen
  project_id UUID REFERENCES pm_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Aktion
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'commented', 'uploaded', 'status_changed', etc.
  entity_type TEXT NOT NULL, -- 'project', 'task', 'comment', 'file', 'invoice'
  entity_id UUID,

  -- Details
  details JSONB DEFAULT '{}', -- Zusätzliche Informationen zur Aktion
  old_value JSONB, -- Vorheriger Wert bei Updates
  new_value JSONB, -- Neuer Wert bei Updates

  -- Metadaten
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- =====================================================
-- 9. PROJECT_FILES (Dateien - Metadaten)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Datei-Infos
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'upload', 'task', 'update', 'invoice'
  mime_type TEXT,
  size_bytes BIGINT,

  -- Storage
  storage_path TEXT NOT NULL, -- Pfad in Supabase Storage
  url TEXT, -- Public URL (wenn öffentlich)

  -- Metadaten
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_task ON project_files(task_id);
CREATE INDEX IF NOT EXISTS idx_project_files_type ON project_files(file_type);

-- =====================================================
-- 10. UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für alle Tabellen mit updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_pm_projects_updated_at ON pm_projects;
CREATE TRIGGER update_pm_projects_updated_at
  BEFORE UPDATE ON pm_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
