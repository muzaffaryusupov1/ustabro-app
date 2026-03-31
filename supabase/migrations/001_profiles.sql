-- ============================================================
-- Migration 001: Profiles & Master Profiles
-- ============================================================

-- profiles table
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         text UNIQUE NOT NULL,
  full_name     text,
  avatar_url    text,
  role          text CHECK (role IN ('customer', 'master')),
  is_active     boolean DEFAULT true,
  location_lat  float8,
  location_lng  float8,
  address       text,
  push_token    text,
  created_at    timestamptz DEFAULT now()
);

-- master_profiles table
CREATE TABLE public.master_profiles (
  id               uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio              text,
  skills           text[] DEFAULT '{}',
  experience_years int DEFAULT 0,
  is_available     boolean DEFAULT true,
  rating           numeric(3,2) DEFAULT 0,
  review_count     int DEFAULT 0,
  verified         boolean DEFAULT false
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_profiles ENABLE ROW LEVEL SECURITY;

-- profiles: user can read their own row
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- profiles: user can update their own row
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- profiles: anyone authenticated can read master profiles (for browse)
CREATE POLICY "Authenticated users can read master profiles"
  ON public.profiles FOR SELECT
  USING (role = 'master' AND is_active = true);

-- master_profiles: owner can read/update their own row
CREATE POLICY "Master can read own master_profile"
  ON public.master_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Master can update own master_profile"
  ON public.master_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- master_profiles: anyone authenticated can read (for browse/ratings)
CREATE POLICY "Authenticated users can read master_profiles"
  ON public.master_profiles FOR SELECT
  USING (true);

-- ============================================================
-- Trigger: auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
