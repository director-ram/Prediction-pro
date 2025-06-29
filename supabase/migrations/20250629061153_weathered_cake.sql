-- Fix users table structure for both email and wallet authentication
DO $$
DECLARE
  email_column_exists boolean := false;
  wallet_address_not_null boolean := false;
  email_not_null boolean := false;
BEGIN
  -- Check if email column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) INTO email_column_exists;
  
  -- Check if wallet_address has NOT NULL constraint
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'wallet_address' AND is_nullable = 'NO'
  ) INTO wallet_address_not_null;
  
  -- Add email column if it doesn't exist
  IF NOT email_column_exists THEN
    ALTER TABLE users ADD COLUMN email text;
    email_column_exists := true;
    RAISE NOTICE 'Added email column to users table';
  END IF;
  
  -- Check if email has NOT NULL constraint (only if column exists)
  IF email_column_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email' AND is_nullable = 'NO'
    ) INTO email_not_null;
    
    -- Remove NOT NULL constraint from email if it exists
    IF email_not_null THEN
      ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
      RAISE NOTICE 'Removed NOT NULL constraint from email column';
    END IF;
  END IF;
  
  -- Remove NOT NULL constraint from wallet_address if it exists
  IF wallet_address_not_null THEN
    ALTER TABLE users ALTER COLUMN wallet_address DROP NOT NULL;
    RAISE NOTICE 'Removed NOT NULL constraint from wallet_address column';
  END IF;
  
  -- Drop existing unique constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_wallet_address_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_wallet_address_key;
    RAISE NOTICE 'Dropped users_wallet_address_key constraint';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_email_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_email_key;
    RAISE NOTICE 'Dropped users_email_key constraint';
  END IF;
  
  -- Drop existing indexes if they exist
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' AND indexname = 'users_wallet_address_unique'
  ) THEN
    DROP INDEX users_wallet_address_unique;
    RAISE NOTICE 'Dropped existing users_wallet_address_unique index';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' AND indexname = 'users_email_unique'
  ) THEN
    DROP INDEX users_email_unique;
    RAISE NOTICE 'Dropped existing users_email_unique index';
  END IF;
  
  -- Drop existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_auth_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_auth_check;
    RAISE NOTICE 'Dropped existing users_auth_check constraint';
  END IF;
  
END $$;

-- Create indexes using dynamic SQL to avoid parser issues
DO $$
DECLARE
  email_column_exists boolean := false;
BEGIN
  -- Check if email column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) INTO email_column_exists;
  
  -- Create unique index for wallet_address that allows NULL values
  CREATE UNIQUE INDEX users_wallet_address_unique 
  ON users (wallet_address) WHERE wallet_address IS NOT NULL;
  RAISE NOTICE 'Created users_wallet_address_unique index';
  
  -- Create unique index for email that allows NULL values (only if email column exists)
  IF email_column_exists THEN
    EXECUTE 'CREATE UNIQUE INDEX users_email_unique ON users (email) WHERE email IS NOT NULL';
    RAISE NOTICE 'Created users_email_unique index';
  END IF;
  
  -- Add the appropriate check constraint
  IF email_column_exists THEN
    EXECUTE 'ALTER TABLE users ADD CONSTRAINT users_auth_check CHECK (email IS NOT NULL OR wallet_address IS NOT NULL)';
    RAISE NOTICE 'Added users_auth_check constraint with email support';
  ELSE
    ALTER TABLE users ADD CONSTRAINT users_auth_check CHECK (wallet_address IS NOT NULL);
    RAISE NOTICE 'Added users_auth_check constraint for wallet-only';
  END IF;
  
END $$;

-- Update RLS policies to handle both authentication methods
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

-- Policy for authenticated users (email/Google auth) to read their own data
CREATE POLICY "Authenticated users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for authenticated users (email/Google auth) to update their own data
CREATE POLICY "Authenticated users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Policy for authenticated users (email/Google auth) to insert their own data
CREATE POLICY "Authenticated users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Policy for anonymous users (wallet-only auth) to manage wallet accounts
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