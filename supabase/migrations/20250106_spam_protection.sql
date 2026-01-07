-- =====================================================
-- SPAM PROTECTION MIGRATION
-- Fuegt is_spam Spalte zu contact_requests hinzu
-- =====================================================

-- is_spam Spalte hinzufuegen
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false;

-- Index fuer Spam-Filterung
CREATE INDEX IF NOT EXISTS idx_contact_requests_is_spam ON contact_requests(is_spam);

-- Bestehende Anfragen als nicht-spam markieren
UPDATE contact_requests SET is_spam = false WHERE is_spam IS NULL;
