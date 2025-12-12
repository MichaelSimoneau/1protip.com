/*
  # Add LinkedIn Integration Fields

  ## Overview
  Adds fields to the profiles table to store LinkedIn OAuth tokens and profile information.

  ## Changes
  1. Add linkedin_access_token field (encrypted storage recommended in production)
  2. Add linkedin_profile_id field
  3. Add linkedin_refresh_token field
  4. Add linkedin_token_expires_at field

  ## Security
  - These fields are only accessible by the profile owner
  - Tokens should be rotated regularly
  - In production, consider using Supabase Vault for token storage
*/

-- Add LinkedIn integration fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_access_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_access_token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_profile_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_profile_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_refresh_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_refresh_token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_token_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_token_expires_at timestamptz;
  END IF;
END $$;

-- Add fields to tips table for LinkedIn post tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'linkedin_post_id'
  ) THEN
    ALTER TABLE tips ADD COLUMN linkedin_post_id text;
  END IF;
END $$;

-- Create index on linkedin_post_id for faster lookups
CREATE INDEX IF NOT EXISTS tips_linkedin_post_id_idx ON tips(linkedin_post_id);
