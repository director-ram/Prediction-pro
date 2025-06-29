-- Fix users table structure for both email and wallet authentication
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;
  
  -- Make email nullable since wallet users might not have email
  ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
  
  -- Make wallet_address nullable since email users might not have wallet
  ALTER TABLE users ALTER COLUMN wallet_address DROP NOT NULL;
  
  -- Update unique constraints to handle both email and wallet users
  -- Drop existing unique constraint on wallet_address if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_wallet_address_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_wallet_address_key;
  END IF;
  
  -- Add unique constraint that allows NULL values
  CREATE UNIQUE INDEX IF NOT EXISTS users_wallet_address_unique 
  ON users (wallet_address) WHERE wallet_address IS NOT NULL;
  
  -- Add unique constraint for email that allows NULL values
  CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique 
  ON users (email) WHERE email IS NOT NULL;
  
  -- Ensure we have proper check constraints
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_check;
  ALTER TABLE users ADD CONSTRAINT users_auth_check 
  CHECK (email IS NOT NULL OR wallet_address IS NOT NULL);
  
END $$;

-- Update RLS policies to handle both authentication methods
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Public read access for profiles" ON users;

-- Policy for authenticated users (email/Google auth)
CREATE POLICY "Authenticated users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for anonymous users (wallet-only auth)
CREATE POLICY "Anonymous users can manage wallet accounts"
  ON users
  FOR ALL
  TO anon
  USING (wallet_address IS NOT NULL)
  WITH CHECK (wallet_address IS NOT NULL);

-- Public read access for leaderboards and public profiles
CREATE POLICY "Public read access for profiles"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);