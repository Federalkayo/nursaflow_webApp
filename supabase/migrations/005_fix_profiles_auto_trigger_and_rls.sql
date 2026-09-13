-- ============================================================================
-- Migration: 005_fix_profiles_auto_trigger_and_rls.sql
-- Description:
--   1. RLS Policy: Allow authenticated users to view profiles (for author names in posts/comments/chats).
--   2. Postgres Trigger: Automatically insert/upsert a public.profiles row upon auth.users creation.
--   3. Data Backfill: Backfill any existing auth.users without a public.profiles row.
-- ============================================================================

-- 1. RLS Policy Update for public.profiles SELECT
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles readable by authenticated users" ON public.profiles;

CREATE POLICY "Profiles readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- 2. Automatic Profile Creation Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, school, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1), 'Nursing Student'),
    COALESCE(NEW.raw_user_meta_data->>'school', 'NursaFlow Nursing Academy'),
    COALESCE(NEW.raw_user_meta_data->>'level', '300 Level (BSN)')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    school = COALESCE(public.profiles.school, EXCLUDED.school),
    level = COALESCE(public.profiles.level, EXCLUDED.level);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Data Backfill: Ensure all existing auth.users have matching profiles
INSERT INTO public.profiles (id, full_name, school, level)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1), 'Nursing Student'),
  COALESCE(u.raw_user_meta_data->>'school', 'NursaFlow Nursing Academy'),
  COALESCE(u.raw_user_meta_data->>'level', '300 Level (BSN)')
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
