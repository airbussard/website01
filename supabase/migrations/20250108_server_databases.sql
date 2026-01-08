-- Server Database Configurations
-- Speichert Datenbank-Verbindungsdaten fuer Server-Monitoring

CREATE TABLE IF NOT EXISTS server_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES monitored_servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT 'localhost',
  port INTEGER NOT NULL DEFAULT 5432,
  database_name TEXT NOT NULL DEFAULT 'postgres',
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  ssl_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index fuer schnelle Abfragen nach server_id
CREATE INDEX IF NOT EXISTS idx_server_databases_server_id ON server_databases(server_id);

-- RLS aktivieren
ALTER TABLE server_databases ENABLE ROW LEVEL SECURITY;

-- Policy: Nur Admins koennen server_databases verwalten
CREATE POLICY "Admins manage server_databases" ON server_databases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Trigger fuer updated_at
CREATE OR REPLACE FUNCTION update_server_databases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER server_databases_updated_at
  BEFORE UPDATE ON server_databases
  FOR EACH ROW
  EXECUTE FUNCTION update_server_databases_updated_at();
