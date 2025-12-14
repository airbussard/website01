-- =====================================================
-- Organizations/Firmen-Modell
-- =====================================================
-- Ermöglicht mehrere User pro Firma und Firmen-basierte
-- Projektzuordnung statt nur einzelner client_id.
-- =====================================================

-- =====================================================
-- 1. TABELLEN
-- =====================================================

-- Organisationen/Firmen
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- für URLs: /org/meine-firma
  logo_url TEXT,
  -- Adresse
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  -- Kontakt
  email TEXT,
  phone TEXT,
  website TEXT,
  -- Meta
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mitgliedschaften (n:m zwischen Users und Organizations)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Organization-ID zu Projekten hinzufügen
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_projects_org ON pm_projects(organization_id);

-- =====================================================
-- 3. HELPER FUNCTIONS
-- =====================================================

-- Prüft ob User Mitglied einer Organisation ist
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Prüft ob User Owner oder Admin einer Organisation ist
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Slug aus Name generieren
CREATE OR REPLACE FUNCTION generate_org_slug(org_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Basis-Slug: Kleinbuchstaben, Umlaute ersetzen, Sonderzeichen entfernen
  base_slug := lower(org_name);
  base_slug := replace(base_slug, 'ä', 'ae');
  base_slug := replace(base_slug, 'ö', 'oe');
  base_slug := replace(base_slug, 'ü', 'ue');
  base_slug := replace(base_slug, 'ß', 'ss');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Eindeutigkeit prüfen
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Auto-generate slug bei INSERT
CREATE OR REPLACE FUNCTION set_org_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_org_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_org_slug ON organizations;
CREATE TRIGGER trigger_set_org_slug
  BEFORE INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_org_slug();

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_org_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_org_updated_at ON organizations;
CREATE TRIGGER trigger_org_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_org_updated_at();

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations: Jeder kann sehen, nur Admins können ändern
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (
    is_org_member(id) OR is_manager_or_admin()
  );

CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE USING (
    is_org_admin(id) OR is_manager_or_admin()
  );

CREATE POLICY "organizations_delete" ON organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = id AND user_id = auth.uid() AND role = 'owner'
    )
    OR is_admin()
  );

-- Organization Members
CREATE POLICY "org_members_select" ON organization_members
  FOR SELECT USING (
    is_org_member(organization_id) OR is_manager_or_admin()
  );

CREATE POLICY "org_members_insert" ON organization_members
  FOR INSERT WITH CHECK (
    is_org_admin(organization_id) OR is_manager_or_admin()
    OR NOT EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id)
  );

CREATE POLICY "org_members_update" ON organization_members
  FOR UPDATE USING (
    is_org_admin(organization_id) OR is_manager_or_admin()
  );

CREATE POLICY "org_members_delete" ON organization_members
  FOR DELETE USING (
    is_org_admin(organization_id)
    OR user_id = auth.uid()
    OR is_manager_or_admin()
  );

-- =====================================================
-- 6. PM_PROJECTS POLICY UPDATE
-- =====================================================

-- Bestehende SELECT Policy droppen und neu erstellen
DROP POLICY IF EXISTS "pm_projects_select" ON pm_projects;

CREATE POLICY "pm_projects_select" ON pm_projects
  FOR SELECT USING (
    -- Projekt-Manager oder Client
    manager_id = auth.uid()
    OR client_id = auth.uid()
    -- Mitglied der zugeordneten Organisation
    OR (organization_id IS NOT NULL AND is_org_member(organization_id))
    -- Projekt-Member
    OR EXISTS (
      SELECT 1 FROM project_members pm WHERE pm.project_id = id AND pm.user_id = auth.uid()
    )
    -- Admin/Manager sieht alles
    OR is_manager_or_admin()
  );
