-- ===========================================
-- SERVER MONITORING SYSTEM
-- ===========================================

-- Tabelle fuer ueberwachte Server
CREATE TABLE monitored_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  agent_port INTEGER DEFAULT 9999,
  auth_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index fuer aktive Server
CREATE INDEX idx_monitored_servers_active ON monitored_servers(is_active);

-- RLS aktivieren
ALTER TABLE monitored_servers ENABLE ROW LEVEL SECURITY;

-- Policy: Nur Admins koennen Server verwalten
CREATE POLICY "Admins can manage servers" ON monitored_servers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Initialer Server (Hetzner Main)
INSERT INTO monitored_servers (name, host, agent_port, auth_token)
VALUES ('Hetzner Main', '188.245.100.156', 9999, 'b179a97154c1a1e3feebe262cb0201df409b483f48bc40cfdbad6cdd94dbd507');
