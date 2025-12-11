/*
  # Add Hashtag Preferences to Profiles

  ## Overview
  Adds a field to store user's hashtag preferences for filtering the LinkedIn feed.

  ## Changes
  1. Add hashtag_preferences field - stores array of hashtags user wants to follow
  2. Set default value to include #1protip

  ## Notes
  - Users can add multiple hashtags to follow
  - #1protip is the default hashtag that all users follow
  - Hashtags are stored in lowercase for consistent filtering
*/

-- Add hashtag preferences field to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hashtag_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hashtag_preferences text[] DEFAULT ARRAY['#1protip'];
  END IF;
END $$;

-- Create index on hashtag_preferences for faster filtering
CREATE INDEX IF NOT EXISTS profiles_hashtag_preferences_idx ON profiles USING GIN (hashtag_preferences);
