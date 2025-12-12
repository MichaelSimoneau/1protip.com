/*
  # Fix RLS Performance and Policy Issues

  ## Changes

  ### 1. RLS Performance Optimization
  All `auth.uid()` calls are wrapped in `(select auth.uid())` to prevent
  re-evaluation for each row, significantly improving query performance at scale.

  ### 2. Consolidate Permissive Policies
  - Merge multiple SELECT policies for authenticated users into single policies
  - This resolves the "Multiple Permissive Policies" warnings

  ### 3. Fix Function Search Path
  - Set stable search_path for `handle_updated_at` function

  ## Security Notes
  - All security restrictions remain the same
  - Only performance and policy structure improved
  - No data access changes
*/

-- Drop existing policies that will be replaced
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all their tips" ON tips;
DROP POLICY IF EXISTS "Published tips are viewable by everyone" ON tips;
DROP POLICY IF EXISTS "Authenticated users can create tips" ON tips;
DROP POLICY IF EXISTS "Users can update own tips" ON tips;
DROP POLICY IF EXISTS "Users can delete own tips" ON tips;
DROP POLICY IF EXISTS "Authenticated users can view all their blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete own blog posts" ON blog_posts;

-- Profiles policies (optimized)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Tips policies (optimized and consolidated)
CREATE POLICY "Tips are viewable by everyone or own unpublished"
  ON tips FOR SELECT
  USING (
    published = true 
    OR (select auth.uid()) = user_id
  );

CREATE POLICY "Authenticated users can create tips"
  ON tips FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tips"
  ON tips FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tips"
  ON tips FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Blog posts policies (optimized and consolidated)
CREATE POLICY "Blog posts are viewable by everyone or own unpublished"
  ON blog_posts FOR SELECT
  USING (
    published = true 
    OR (select auth.uid()) = user_id
  );

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix function search path to be stable
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
