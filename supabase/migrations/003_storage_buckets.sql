-- =====================================================
-- SUPABASE STORAGE BUCKETS
-- =====================================================
-- Bucket: project_files
-- Struktur:
--   project_files/{project_id}/uploads/
--   project_files/{project_id}/tasks/
--   project_files/{project_id}/updates/
--   project_files/{project_id}/invoices/
-- =====================================================

-- Bucket erstellen (falls nicht existiert)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- SELECT: User können Dateien ihrer Projekte sehen
DROP POLICY IF EXISTS "project_files_select" ON storage.objects;
CREATE POLICY "project_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project_files'
    AND (
      -- Admin/Manager sehen alles
      is_manager_or_admin()
      -- User sehen nur Dateien ihrer Projekte
      OR EXISTS (
        SELECT 1 FROM pm_projects p
        WHERE p.client_id = auth.uid()
        AND (storage.foldername(name))[1] = p.id::text
      )
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.user_id = auth.uid()
        AND (storage.foldername(name))[1] = pm.project_id::text
      )
    )
  );

-- INSERT: User können in ihre Projekte hochladen
DROP POLICY IF EXISTS "project_files_insert" ON storage.objects;
CREATE POLICY "project_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project_files'
    AND (
      -- Admin/Manager können überall hochladen
      is_manager_or_admin()
      -- User können nur in ihre Projekte hochladen
      OR EXISTS (
        SELECT 1 FROM pm_projects p
        WHERE p.client_id = auth.uid()
        AND (storage.foldername(name))[1] = p.id::text
      )
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.user_id = auth.uid()
        AND (storage.foldername(name))[1] = pm.project_id::text
      )
    )
  );

-- UPDATE: Nur eigene Dateien oder Admin
DROP POLICY IF EXISTS "project_files_update" ON storage.objects;
CREATE POLICY "project_files_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project_files'
    AND (owner = auth.uid() OR is_admin())
  );

-- DELETE: Nur eigene Dateien oder Manager/Admin
DROP POLICY IF EXISTS "project_files_delete" ON storage.objects;
CREATE POLICY "project_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project_files'
    AND (owner = auth.uid() OR is_manager_or_admin())
  );
