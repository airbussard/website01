-- =====================================================
-- PROFILE ERWEITERUNG: Vor-/Nachname, Adressen, Handynummer
-- =====================================================

-- Vor- und Nachname als separate Felder
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Privatadresse
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Deutschland';

-- Firmenadresse
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_street TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_country TEXT DEFAULT 'Deutschland';

-- Handynummer
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Bestehende full_name Daten in first_name/last_name migrieren
UPDATE profiles
SET
  first_name = CASE
    WHEN full_name IS NOT NULL AND full_name LIKE '% %'
    THEN split_part(full_name, ' ', 1)
    ELSE full_name
  END,
  last_name = CASE
    WHEN full_name IS NOT NULL AND full_name LIKE '% %'
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE NULL
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Trigger aktualisieren um full_name automatisch zu aktualisieren
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  IF NEW.full_name = '' THEN
    NEW.full_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_full_name ON profiles;
CREATE TRIGGER trigger_update_full_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_full_name();
