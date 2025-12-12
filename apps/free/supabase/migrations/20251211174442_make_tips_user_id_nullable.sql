/*
  # Make tips.user_id nullable for community posts

  ## Overview
  Allows tips to exist without a user_id for sample/community posts that aren't tied to a specific user.

  ## Changes
  1. Make user_id field nullable in tips table
  2. This enables sample posts to be displayed before users connect their LinkedIn

  ## Notes
  - Posts with user_id are from authenticated users
  - Posts without user_id are sample/community posts
*/

-- Make user_id nullable in tips table
DO $$
BEGIN
  ALTER TABLE tips ALTER COLUMN user_id DROP NOT NULL;
END $$;
