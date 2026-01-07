-- =====================================================
-- LEXOFFICE INTEGRATION MIGRATION
-- Erstellt: 2025-01-07
-- =====================================================

-- =====================================================
-- 1. SYSTEM SETTINGS TABLE (fuer API Key etc.)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Initial Lexoffice Settings
INSERT INTO system_settings (key, value) VALUES (
  'lexoffice',
  '{"is_enabled": false, "api_key": null, "last_sync_at": null}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 2. INVOICES ERWEITERUNG
-- =====================================================

-- Lexoffice-Felder zur invoices Tabelle hinzufuegen
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lexoffice_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lexoffice_status TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS line_items JSONB;

-- Index fuer Lexoffice-ID
CREATE INDEX IF NOT EXISTS idx_invoices_lexoffice_id ON invoices(lexoffice_id) WHERE lexoffice_id IS NOT NULL;

-- =====================================================
-- 3. LEXOFFICE CONTACTS MAPPING
-- =====================================================

CREATE TABLE IF NOT EXISTS lexoffice_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lexoffice_contact_id UUID NOT NULL,
  lexoffice_contact_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Entweder profile_id ODER organization_id muss gesetzt sein
  CONSTRAINT chk_contact_reference CHECK (
    (profile_id IS NOT NULL AND organization_id IS NULL) OR
    (profile_id IS NULL AND organization_id IS NOT NULL)
  )
);

-- Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_lexoffice_contacts_profile ON lexoffice_contacts(profile_id) WHERE profile_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_lexoffice_contacts_org ON lexoffice_contacts(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lexoffice_contacts_lexoffice_id ON lexoffice_contacts(lexoffice_contact_id);

-- =====================================================
-- 4. QUOTATIONS (ANGEBOTE)
-- =====================================================

CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES pm_projects(id) ON DELETE CASCADE,
  quotation_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Positionen als JSONB
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Betraege
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',

  -- Status und Daten
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  -- Lexoffice Sync
  lexoffice_id UUID,
  lexoffice_status TEXT,
  synced_at TIMESTAMPTZ,
  pdf_url TEXT,

  -- Meta
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotations_project ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_lexoffice_id ON quotations(lexoffice_id) WHERE lexoffice_id IS NOT NULL;

-- =====================================================
-- 5. RECURRING INVOICES (WIEDERKEHRENDE RECHNUNGEN)
-- =====================================================

CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES pm_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,

  -- Positionen als JSONB (wie bei Quotations)
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Betraege (Template-Werte)
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate INTEGER NOT NULL DEFAULT 19 CHECK (tax_rate IN (0, 7, 19)),

  -- Recurring Settings
  interval_type TEXT NOT NULL CHECK (interval_type IN ('monthly', 'quarterly', 'yearly')),
  interval_value INTEGER NOT NULL DEFAULT 1 CHECK (interval_value > 0),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = unbefristet
  next_invoice_date DATE NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMPTZ,
  invoices_generated INTEGER DEFAULT 0,

  -- Optionen
  auto_send BOOLEAN DEFAULT false, -- Automatisch an Lexoffice senden
  send_notification BOOLEAN DEFAULT true, -- Email-Benachrichtigung bei Generierung

  -- Meta
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_project ON recurring_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(is_active);

-- =====================================================
-- 6. RECURRING INVOICE HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS recurring_invoice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,

  CONSTRAINT fk_recurring_invoice FOREIGN KEY (recurring_invoice_id) REFERENCES recurring_invoices(id)
);

CREATE INDEX IF NOT EXISTS idx_recurring_history_recurring ON recurring_invoice_history(recurring_invoice_id);

-- =====================================================
-- 7. LEXOFFICE SYNC LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS lexoffice_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'invoice', 'quotation')),
  entity_id UUID NOT NULL,
  lexoffice_id UUID,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'sync_status', 'sync_pdf')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_entity ON lexoffice_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON lexoffice_sync_log(status) WHERE status = 'failed';

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- System Settings: Nur Admins
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Quotations: Wie Invoices
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotations for their projects"
  ON quotations FOR SELECT
  TO authenticated
  USING (has_project_access(project_id));

CREATE POLICY "Managers can create quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

-- Recurring Invoices: Nur Manager/Admin
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view recurring invoices"
  ON recurring_invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can manage recurring invoices"
  ON recurring_invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

-- Lexoffice Contacts: Nur Manager/Admin
ALTER TABLE lexoffice_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view lexoffice contacts"
  ON lexoffice_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can manage lexoffice contacts"
  ON lexoffice_contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

-- Sync Log: Nur Admins
ALTER TABLE lexoffice_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync log"
  ON lexoffice_sync_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 9. UPDATED_AT TRIGGER
-- =====================================================

-- Trigger-Funktion (falls noch nicht existiert)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers fuer neue Tabellen
DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_recurring_invoices_updated_at ON recurring_invoices;
CREATE TRIGGER update_recurring_invoices_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_lexoffice_contacts_updated_at ON lexoffice_contacts;
CREATE TRIGGER update_lexoffice_contacts_updated_at
  BEFORE UPDATE ON lexoffice_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FERTIG
-- =====================================================

COMMENT ON TABLE system_settings IS 'System-weite Einstellungen wie Lexoffice API Key';
COMMENT ON TABLE lexoffice_contacts IS 'Mapping zwischen lokalen Profilen/Organisationen und Lexoffice Kontakten';
COMMENT ON TABLE quotations IS 'Angebote mit optionaler Lexoffice-Synchronisation';
COMMENT ON TABLE recurring_invoices IS 'Vorlagen fuer wiederkehrende Rechnungen';
COMMENT ON TABLE recurring_invoice_history IS 'Historie der generierten Rechnungen aus Recurring Templates';
COMMENT ON TABLE lexoffice_sync_log IS 'Audit-Log fuer alle Lexoffice API Operationen';
