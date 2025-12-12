-- =====================================================
-- EMAIL SYSTEM MIGRATION
-- Erstellt Tabellen für E-Mail-Warteschlange und Einstellungen
-- =====================================================

-- =====================================================
-- 1. EMAIL SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host TEXT NOT NULL DEFAULT 'smtp.strato.de',
  smtp_port INTEGER NOT NULL DEFAULT 465,
  smtp_user TEXT NOT NULL DEFAULT '',
  smtp_password TEXT NOT NULL DEFAULT '',
  imap_host TEXT DEFAULT 'imap.strato.de',
  imap_port INTEGER DEFAULT 993,
  imap_user TEXT DEFAULT '',
  imap_password TEXT DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT 'getemergence.com',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_email_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_email_settings_updated_at ON email_settings;
CREATE TRIGGER trigger_email_settings_updated_at
  BEFORE UPDATE ON email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_email_settings_updated_at();

-- Standard-Eintrag einfügen (falls noch nicht vorhanden)
INSERT INTO email_settings (smtp_host, smtp_port, from_email, from_name)
SELECT 'smtp.strato.de', 465, 'hello@getemergence.com', 'getemergence.com'
WHERE NOT EXISTS (SELECT 1 FROM email_settings LIMIT 1);

-- =====================================================
-- 2. EMAIL QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  type TEXT DEFAULT 'notification' CHECK (type IN ('notification', 'contact', 'system')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_status_attempts ON email_queue(status, attempts);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

-- RLS aktivieren
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policies für email_settings (nur Service-Role)
DROP POLICY IF EXISTS "email_settings_service_role_select" ON email_settings;
DROP POLICY IF EXISTS "email_settings_service_role_insert" ON email_settings;
DROP POLICY IF EXISTS "email_settings_service_role_update" ON email_settings;
DROP POLICY IF EXISTS "email_settings_service_role_delete" ON email_settings;

CREATE POLICY "email_settings_service_role_select" ON email_settings
  FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "email_settings_service_role_insert" ON email_settings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "email_settings_service_role_update" ON email_settings
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "email_settings_service_role_delete" ON email_settings
  FOR DELETE USING (auth.role() = 'service_role');

-- Policies für email_queue (nur Service-Role)
DROP POLICY IF EXISTS "email_queue_service_role_select" ON email_queue;
DROP POLICY IF EXISTS "email_queue_service_role_insert" ON email_queue;
DROP POLICY IF EXISTS "email_queue_service_role_update" ON email_queue;
DROP POLICY IF EXISTS "email_queue_service_role_delete" ON email_queue;

CREATE POLICY "email_queue_service_role_select" ON email_queue
  FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "email_queue_service_role_insert" ON email_queue
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "email_queue_service_role_update" ON email_queue
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "email_queue_service_role_delete" ON email_queue
  FOR DELETE USING (auth.role() = 'service_role');

-- =====================================================
-- 4. HILFSFUNKTION: Atomisches Claimen von E-Mails
-- =====================================================
CREATE OR REPLACE FUNCTION claim_pending_emails(max_count INTEGER DEFAULT 10)
RETURNS SETOF email_queue AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT id
    FROM email_queue
    WHERE status = 'pending'
      AND attempts < max_attempts
    ORDER BY created_at ASC
    LIMIT max_count
    FOR UPDATE SKIP LOCKED
  )
  UPDATE email_queue eq
  SET
    status = 'processing',
    last_attempt_at = NOW(),
    attempts = attempts + 1
  FROM claimed c
  WHERE eq.id = c.id
  RETURNING eq.*;
END;
$$ LANGUAGE plpgsql;
