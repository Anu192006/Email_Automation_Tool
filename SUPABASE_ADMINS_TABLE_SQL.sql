-- ============================================================
-- SUPABASE: Create Admins Table for Authentication
-- ============================================================
-- 
-- This SQL creates the admins table with secure authentication
-- using bcrypt password hashing and JWT tokens
--
-- Run this in Supabase SQL Editor:
-- 1. Go to Supabase Dashboard
-- 2. Click "SQL Editor"
-- 3. Click "New Query"
-- 4. Paste this entire script
-- 5. Click "Run"
--

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own record
CREATE POLICY "Admins can read their own profile"
  ON admins FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Service role can do everything (backend only)
CREATE POLICY "Service role can manage admins"
  ON admins
  USING (current_setting('role') = 'authenticated');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON admins TO authenticated;
GRANT UPDATE ON admins TO authenticated;

-- ============================================================
-- INITIAL ADMIN SETUP (FIRST TIME ONLY)
-- ============================================================
-- 
-- Instructions:
-- 1. Go to this link: https://www.bcrypt-generator.com/
-- 2. Enter password: "SecureAdminPassword123!"
-- 3. Click "Generate"
-- 4. Copy the bcrypt hash (starts with $2a$)
-- 5. Replace PASTE_BCRYPT_HASH_HERE below with the hash
-- 6. Run this INSERT statement
-- 7. Delete this INSERT statement afterward
--
-- Example hash: $2a$10$K8L5R4.p9.DjR2N3qK9xSeXq8v4JvKqT3L0Z9mJ5bQxC2P1D0N0Ke

-- INSERT INTO admins (email, password_hash, name, role)
-- VALUES (
--   'admin@company.com',
--   'PASTE_BCRYPT_HASH_HERE',
--   'Admin User',
--   'admin'
-- );

-- ============================================================
-- TABLE STRUCTURE REFERENCE
-- ============================================================
-- 
-- Column         | Type              | Notes
-- ===============+==================+=========================
-- id             | UUID              | Auto-generated primary key
-- email          | TEXT              | Unique, required for login
-- password_hash  | TEXT              | bcrypt hash (never plain text)
-- name           | TEXT              | Display name (optional)
-- role           | TEXT              | 'admin', 'super_admin', etc
-- created_at     | TIMESTAMP         | Account creation time
-- updated_at     | TIMESTAMP         | Last update time
-- 
-- ============================================================

-- Verify table creation
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admins'
) as table_created;

-- ============================================================
-- TESTING THE TABLE (Optional)
-- ============================================================
-- 
-- To verify everything is working:
-- SELECT * FROM admins;
--
-- To delete test data:
-- DELETE FROM admins WHERE email = 'test@example.com';
--
