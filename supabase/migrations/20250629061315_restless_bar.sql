-- Simple migration to add email support to users table
-- Add email column (will be ignored if already exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;

-- Make both email and wallet_address nullable
ALTER TABLE users ALTER COLUMN wallet_address DROP NOT NULL;

-- Drop existing constraints that might conflict
DROP CONSTRAINT IF EXISTS users_wallet_address_key;
DROP CONSTRAINT IF EXISTS users_email_key;
DROP CONSTRAINT IF EXISTS users_auth_check;

-- Create partial unique indexes (allows NULL values)
DROP INDEX IF EXISTS users_wallet_address_unique;
DROP INDEX IF EXISTS users_email_unique;

CREATE UNIQUE INDEX users_wallet_address_unique 
ON users (wallet_address) WHERE wallet_address IS NOT NULL;

CREATE UNIQUE INDEX users_email_unique 
ON users (email) WHERE email IS NOT NULL;

-- Add check constraint to ensure at least one auth method
ALTER TABLE users ADD CONSTRAINT users_auth_check 
CHECK (email IS NOT NULL OR wallet_address IS NOT NULL);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Public read access for profiles" ON users;
DROP POLICY IF EXISTS "Allow wallet registration" ON users;
DROP POLICY IF EXISTS "Users can read own wallet data" ON users;
DROP POLICY IF EXISTS "Users can update own wallet data" ON users;
DROP POLICY IF EXISTS "Authenticated users can read own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can update own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert own data" ON users;
DROP POLICY IF EXISTS "Anonymous users can manage wallet accounts" ON users;

-- Policies for Supabase Auth users
CREATE POLICY "Authenticated users can read own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can update own data"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can insert own data"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Policies for wallet-only users
CREATE POLICY "Anonymous users can manage wallet accounts"
  ON users FOR ALL TO anon
  USING (wallet_address IS NOT NULL)
  WITH CHECK (wallet_address IS NOT NULL);

-- Public read access
CREATE POLICY "Public read access for profiles"
  ON users FOR SELECT TO anon, authenticated
  USING (true);