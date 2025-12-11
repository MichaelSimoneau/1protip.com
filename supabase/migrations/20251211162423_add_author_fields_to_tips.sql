/*
  # Add Author Fields to Tips Table

  ## Overview
  Adds fields to store author information for tips from multiple LinkedIn users
  with the #1ProTip hashtag. This enables the app to display a feed of tips
  from the entire LinkedIn community, not just the authenticated user.

  ## Changes
  1. New Columns Added to `tips` table:
    - `author_name` (text) - Display name of the person who posted the tip
    - `author_linkedin_id` (text) - LinkedIn member ID of the author
    - `author_avatar_url` (text) - Profile picture URL
    - `author_profile_url` (text) - LinkedIn profile URL
    - `is_owner` (boolean) - Flag to distinguish user's own posts

  ## Security
  - RLS policies remain restrictive for write operations
  - Read access allows viewing all published tips (community feed)
  - Users can only edit/delete their own tips
*/

-- Add author information fields to tips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE tips ADD COLUMN author_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'author_linkedin_id'
  ) THEN
    ALTER TABLE tips ADD COLUMN author_linkedin_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'author_avatar_url'
  ) THEN
    ALTER TABLE tips ADD COLUMN author_avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'author_profile_url'
  ) THEN
    ALTER TABLE tips ADD COLUMN author_profile_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'is_owner'
  ) THEN
    ALTER TABLE tips ADD COLUMN is_owner boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS tips_author_linkedin_id_idx ON tips(author_linkedin_id);
CREATE INDEX IF NOT EXISTS tips_is_owner_idx ON tips(is_owner);
