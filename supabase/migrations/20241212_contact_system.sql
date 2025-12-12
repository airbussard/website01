-- =====================================================
-- CONTACT SYSTEM MIGRATION
-- Erweitert contact_requests und fügt email_messages hinzu
-- =====================================================

-- =====================================================
-- 1. CONTACT_REQUESTS ERWEITERN
-- =====================================================

-- Ticket-Nummer (auto-increment)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'ticket_number') THEN
    -- Sequence erstellen
    CREATE SEQUENCE IF NOT EXISTS contact_requests_ticket_number_seq;
    -- Spalte hinzufügen
    ALTER TABLE contact_requests ADD COLUMN ticket_number INTEGER DEFAULT nextval('contact_requests_ticket_number_seq');
  END IF;
END $$;

-- Status-Spalte
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'neu';

-- Interne Notizen
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Updated-At Timestamp
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Check-Constraint für Status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'contact_requests' AND constraint_name = 'contact_requests_status_check') THEN
    ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_status_check
      CHECK (status IN ('neu', 'in_bearbeitung', 'erledigt'));
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_contact_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contact_requests_updated_at ON contact_requests;
CREATE TRIGGER trigger_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_requests_updated_at();

-- Index für Status-Filterung
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- =====================================================
-- 2. EMAIL_MESSAGES TABELLE (Konversationsverlauf)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id UUID REFERENCES contact_requests(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  content_html TEXT,
  content_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_email_messages_contact_request ON email_messages(contact_request_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at ON email_messages(created_at);

-- =====================================================
-- 3. EMAIL_QUEUE ERWEITERN
-- =====================================================

ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS contact_request_id UUID REFERENCES contact_requests(id) ON DELETE SET NULL;

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================

-- RLS für email_messages aktivieren
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;

-- Policies für email_messages (nur Service-Role)
DROP POLICY IF EXISTS "email_messages_service_role_select" ON email_messages;
DROP POLICY IF EXISTS "email_messages_service_role_insert" ON email_messages;
DROP POLICY IF EXISTS "email_messages_service_role_update" ON email_messages;
DROP POLICY IF EXISTS "email_messages_service_role_delete" ON email_messages;

CREATE POLICY "email_messages_service_role_select" ON email_messages
  FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "email_messages_service_role_insert" ON email_messages
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "email_messages_service_role_update" ON email_messages
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "email_messages_service_role_delete" ON email_messages
  FOR DELETE USING (auth.role() = 'service_role');

-- =====================================================
-- 5. BESTEHENDE ANFRAGEN AKTUALISIEREN
-- =====================================================

-- Alle bestehenden Anfragen ohne Status auf 'neu' setzen
UPDATE contact_requests SET status = 'neu' WHERE status IS NULL;

-- Ticket-Nummern für bestehende Anfragen vergeben (falls noch keine)
UPDATE contact_requests
SET ticket_number = nextval('contact_requests_ticket_number_seq')
WHERE ticket_number IS NULL;
