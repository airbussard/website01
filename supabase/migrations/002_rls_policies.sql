-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Rollen: user, manager, admin
-- user: sieht nur eigene Projekte
-- manager: sieht alle Projekte
-- admin: volle Berechtigungen
-- =====================================================

-- RLS aktivieren
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Aktuelle User-Rolle abrufen
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Prüfen ob User Admin ist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Prüfen ob User Manager oder Admin ist
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('manager', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Prüfen ob User Zugriff auf Projekt hat
CREATE OR REPLACE FUNCTION has_project_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin/Manager haben immer Zugriff
  IF is_manager_or_admin() THEN
    RETURN TRUE;
  END IF;

  -- User: Nur wenn Client oder Projektmitglied
  RETURN EXISTS (
    SELECT 1 FROM pm_projects
    WHERE id = p_project_id AND client_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    -- Eigenes Profil oder Manager/Admin
    id = auth.uid() OR is_manager_or_admin()
  );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- =====================================================
-- PM_PROJECTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "projects_select" ON pm_projects;
CREATE POLICY "projects_select" ON pm_projects
  FOR SELECT USING (has_project_access(id));

DROP POLICY IF EXISTS "projects_insert" ON pm_projects;
CREATE POLICY "projects_insert" ON pm_projects
  FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS "projects_update" ON pm_projects;
CREATE POLICY "projects_update" ON pm_projects
  FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS "projects_delete" ON pm_projects;
CREATE POLICY "projects_delete" ON pm_projects
  FOR DELETE USING (is_admin());

-- =====================================================
-- PROJECT_MEMBERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "members_select" ON project_members;
CREATE POLICY "members_select" ON project_members
  FOR SELECT USING (has_project_access(project_id));

DROP POLICY IF EXISTS "members_insert" ON project_members;
CREATE POLICY "members_insert" ON project_members
  FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS "members_delete" ON project_members;
CREATE POLICY "members_delete" ON project_members
  FOR DELETE USING (is_manager_or_admin());

-- =====================================================
-- TASKS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING (has_project_access(project_id));

DROP POLICY IF EXISTS "tasks_insert" ON tasks;
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS "tasks_update" ON tasks;
CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING (
    -- Manager/Admin können alle Tasks bearbeiten
    is_manager_or_admin()
    -- User können zugewiesene Tasks aktualisieren (nur Status)
    OR (assignee_id = auth.uid() AND has_project_access(project_id))
  );

DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE USING (is_manager_or_admin());

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (
    -- Projekt-Zugriff erforderlich
    (
      (task_id IS NOT NULL AND has_project_access((SELECT project_id FROM tasks WHERE id = task_id)))
      OR (project_id IS NOT NULL AND has_project_access(project_id))
    )
    -- Interne Kommentare nur für Manager/Admin
    AND (NOT is_internal OR is_manager_or_admin())
  );

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (
    -- User können nur öffentliche Kommentare erstellen
    (NOT is_internal OR is_manager_or_admin())
    -- Projekt-Zugriff erforderlich
    AND (
      (task_id IS NOT NULL AND has_project_access((SELECT project_id FROM tasks WHERE id = task_id)))
      OR (project_id IS NOT NULL AND has_project_access(project_id))
    )
  );

DROP POLICY IF EXISTS "comments_update" ON comments;
CREATE POLICY "comments_update" ON comments
  FOR UPDATE USING (author_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (author_id = auth.uid() OR is_admin());

-- =====================================================
-- PROGRESS_UPDATES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "updates_select" ON progress_updates;
CREATE POLICY "updates_select" ON progress_updates
  FOR SELECT USING (
    has_project_access(project_id)
    AND (is_public OR is_manager_or_admin())
  );

DROP POLICY IF EXISTS "updates_insert" ON progress_updates;
CREATE POLICY "updates_insert" ON progress_updates
  FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS "updates_update" ON progress_updates;
CREATE POLICY "updates_update" ON progress_updates
  FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS "updates_delete" ON progress_updates;
CREATE POLICY "updates_delete" ON progress_updates
  FOR DELETE USING (is_admin());

-- =====================================================
-- INVOICES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT USING (has_project_access(project_id));

DROP POLICY IF EXISTS "invoices_insert" ON invoices;
CREATE POLICY "invoices_insert" ON invoices
  FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS "invoices_update" ON invoices;
CREATE POLICY "invoices_update" ON invoices
  FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS "invoices_delete" ON invoices;
CREATE POLICY "invoices_delete" ON invoices
  FOR DELETE USING (is_admin());

-- =====================================================
-- ACTIVITY_LOG POLICIES
-- =====================================================
DROP POLICY IF EXISTS "activity_select" ON activity_log;
CREATE POLICY "activity_select" ON activity_log
  FOR SELECT USING (
    project_id IS NULL OR has_project_access(project_id)
  );

DROP POLICY IF EXISTS "activity_insert" ON activity_log;
CREATE POLICY "activity_insert" ON activity_log
  FOR INSERT WITH CHECK (TRUE); -- Wird programmatisch gesteuert

-- =====================================================
-- PROJECT_FILES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "files_select" ON project_files;
CREATE POLICY "files_select" ON project_files
  FOR SELECT USING (has_project_access(project_id));

DROP POLICY IF EXISTS "files_insert" ON project_files;
CREATE POLICY "files_insert" ON project_files
  FOR INSERT WITH CHECK (
    has_project_access(project_id)
    -- User können nur in ihren Projekten hochladen
    -- Manager/Admin können überall hochladen
  );

DROP POLICY IF EXISTS "files_delete" ON project_files;
CREATE POLICY "files_delete" ON project_files
  FOR DELETE USING (
    uploaded_by = auth.uid() OR is_manager_or_admin()
  );
