-- ═══════════════════════════════════════════════════════════════════════════════
-- SUPABASE SCHEMA SETUP - Complete Database for Automail System
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- This file contains ALL SQL needed to set up the database for the full stack
-- authentication + email automation system.
--
-- ⚠️ IMPORTANT:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Click "New Query"
-- 4. Paste entire content
-- 5. Click "Run"
-- 6. Wait for success message
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 1: ADMINS (User Authentication)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for fast lookups during login
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- Add RLS policy to admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read their own record"
  ON admins FOR SELECT
  USING (auth.uid()::text = id::text);

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 2: RECIPIENT BATCHES (Email Targets)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recipient_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'opted_out', 'emailed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_recipient_email ON recipient_batches(email);
CREATE INDEX IF NOT EXISTS idx_recipient_status ON recipient_batches(status);
CREATE INDEX IF NOT EXISTS idx_recipient_created ON recipient_batches(created_at DESC);

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 3: EMAIL TEMPLATES (Save Email Templates)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_created ON templates(created_at DESC);

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 4: EMAIL LOGS (Track Sent Emails - Optional)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipient_batches(id),
  admin_id UUID NOT NULL REFERENCES admins(id),
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_admin ON email_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- ═════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA
-- ═════════════════════════════════════════════════════════════════════════════

-- ⚠️ IMPORTANT: These are DEMO accounts with bcrypt hashes
-- The password_hash is bcrypt(12345678, salt_rounds=10)
-- DO NOT USE IN PRODUCTION - Generate real bcrypt hashes

-- Demo Admin User
INSERT INTO admins (email, password_hash, name, role, status) 
VALUES (
  'admin@demo.com',
  '$2a$10$K8L5R4.p9.DjR2N3qK9xSeXq8v4JvKqT3L0Z9mJ5bQxC2P1D0N0Ke',
  'Demo Admin',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Demo Recipients for Email Sending
INSERT INTO recipient_batches (email, name, company, status)
VALUES
  ('john.doe@example.com', 'John Doe', 'Tech Corp', 'active'),
  ('jane.smith@example.com', 'Jane Smith', 'Innovation Inc', 'active'),
  ('bob.johnson@example.com', 'Bob Johnson', 'Digital Solutions', 'active'),
  ('alice.williams@example.com', 'Alice Williams', 'Cloud Services', 'active'),
  ('charlie.brown@example.com', 'Charlie Brown', 'Data Analytics', 'active')
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEWS (For easier querying)
-- ═════════════════════════════════════════════════════════════════════════════

-- View to get admin info with email stats
CREATE OR REPLACE VIEW admin_email_stats AS
SELECT 
  a.id,
  a.email,
  a.name,
  a.role,
  COUNT(CASE WHEN el.status = 'sent' THEN 1 END)::INT as emails_sent,
  COUNT(CASE WHEN el.status = 'failed' THEN 1 END)::INT as emails_failed,
  a.last_login,
  a.created_at
FROM admins a
LEFT JOIN email_logs el ON a.id = el.admin_id
WHERE a.status = 'active'
GROUP BY a.id, a.email, a.name, a.role, a.last_login, a.created_at;

-- View to get active recipients
CREATE OR REPLACE VIEW active_recipients AS
SELECT 
  id,
  email,
  name,
  company,
  status,
  created_at
FROM recipient_batches
WHERE status = 'active'
ORDER BY created_at ASC;

-- ═════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS (For automation)
-- ═════════════════════════════════════════════════════════════════════════════

-- Function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admins SET last_login = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get next recipient for email sending
CREATE OR REPLACE FUNCTION get_next_active_recipient()
RETURNS SETOF recipient_batches AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM recipient_batches
  WHERE status = 'active'
  ORDER BY created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ═════════════════════════════════════════════════════════════════════════════
-- HELPFUL COMMANDS (Run these in SQL editor for testing)
-- ═════════════════════════════════════════════════════════════════════════════

-- Test 1: Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public';

-- Test 2: Count admins
-- SELECT COUNT(*) as admin_count FROM admins;

-- Test 3: Count active recipients
-- SELECT COUNT(*) as recipient_count FROM recipient_batches WHERE status = 'active';

-- Test 4: Get first active recipient
-- SELECT * FROM recipient_batches WHERE status = 'active' LIMIT 1;

-- Test 5: View email statistics
-- SELECT * FROM admin_email_stats;

-- ═════════════════════════════════════════════════════════════════════════════
-- IMPORTANT SETUP NOTES
-- ═════════════════════════════════════════════════════════════════════════════

-- ✅ After running this SQL, you should have:
--    1. admins table with 1 demo user (admin@demo.com)
--    2. recipient_batches table with 5 sample recipients
--    3. email_logs table for tracking sent emails
--    4. Indexes for fast queries
--    5. Views for easier data access
--    6. Functions for automation

-- ✅ Demo Credentials (for testing):
--    Email: admin@demo.com
--    Password: 12345678 (this is a bcrypt hash, cannot reverse)

-- ⚠️ To add your own admin user:
--    1. Generate bcrypt hash of your password at https://bcrypt-generator.com
--    2. Run: INSERT INTO admins (email, password_hash, name, role)
--            VALUES ('your-email@domain.com', 'BCRYPT_HASH_HERE', 'Your Name', 'admin');

-- ⚠️ To add more recipients:
--    INSERT INTO recipient_batches (email, name, company, status)
--    VALUES ('recipient@email.com', 'Recipient Name', 'Company Name', 'active');

-- ═════════════════════════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═════════════════════════════════════════════════════════════════════════════

-- If you see this without errors, your database is ready!
-- You can now use the Automail system:
-- 1. Login with: admin@demo.com / 12345678
-- 2. Click "Send Email" button
-- 3. System will fetch a recipient and send email
-- 4. Check your inbox for the email

-- ═════════════════════════════════════════════════════════════════════════════
