-- =====================================================
-- CONTRACTS (Vertraege) MIGRATION
-- =====================================================
-- Erstellt am: 2024-12-13
-- Zweck: Vertragsunterschrift-Funktion fuer Projekte
-- =====================================================

-- Contracts Tabelle erstellen
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,

  -- Vertragsdaten
  title TEXT NOT NULL,
  description TEXT,

  -- Status: pending_signature, signed, expired, cancelled
  status TEXT NOT NULL DEFAULT 'pending_signature'
    CHECK (status IN ('pending_signature', 'signed', 'expired', 'cancelled')),

  -- Original PDF (vom Admin hochgeladen)
  original_pdf_path TEXT NOT NULL,
  original_pdf_url TEXT,

  -- Signiertes PDF (nach Unterschrift)
  signed_pdf_path TEXT,
  signed_pdf_url TEXT,

  -- Unterschrift
  signature_data TEXT,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES profiles(id),
  signer_ip TEXT,
  signer_user_agent TEXT,

  -- Termine
  valid_until DATE,

  -- Metadaten
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes fuer schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_signed_by ON contracts(signed_by);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by);

-- Updated_at Trigger (nutzt existierende Funktion)
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- SELECT: Projektmitglieder koennen Vertraege sehen
DROP POLICY IF EXISTS "contracts_select" ON contracts;
CREATE POLICY "contracts_select" ON contracts
  FOR SELECT USING (has_project_access(project_id));

-- INSERT: Nur Manager/Admin koennen Vertraege erstellen
DROP POLICY IF EXISTS "contracts_insert" ON contracts;
CREATE POLICY "contracts_insert" ON contracts
  FOR INSERT WITH CHECK (is_manager_or_admin());

-- UPDATE: Manager/Admin ODER Client des Projekts (fuer Signatur)
DROP POLICY IF EXISTS "contracts_update" ON contracts;
CREATE POLICY "contracts_update" ON contracts
  FOR UPDATE USING (
    is_manager_or_admin()
    OR (
      -- Client kann nur pending Vertraege signieren
      status = 'pending_signature'
      AND has_project_access(project_id)
      AND EXISTS (
        SELECT 1 FROM pm_projects
        WHERE id = project_id AND client_id = auth.uid()
      )
    )
  );

-- DELETE: Nur Admin
DROP POLICY IF EXISTS "contracts_delete" ON contracts;
CREATE POLICY "contracts_delete" ON contracts
  FOR DELETE USING (is_admin());

-- =====================================================
-- KOMMENTAR: Activity Actions erweitern
-- =====================================================
-- Die folgenden Actions sollten im Code unterstuetzt werden:
-- 'contract_uploaded' - Wenn ein Vertrag hochgeladen wird
-- 'contract_signed' - Wenn ein Vertrag unterschrieben wird
-- Diese werden programmatisch in activity_log eingefuegt
