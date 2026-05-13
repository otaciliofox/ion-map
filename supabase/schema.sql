-- ion-map: Schema SQL completo
-- Execute no Supabase SQL Editor

-- ─── Profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'supervisor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Establishments ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS establishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Photos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS establishment_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('place', 'equipment')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Approval Logs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Auto-create profile on sign up ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "users_own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_supervisor_view_profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')));

-- Establishments
CREATE POLICY "anon_active_establishments" ON establishments FOR SELECT USING (status = 'active');
CREATE POLICY "users_own_establishments" ON establishments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "supervisor_admin_all" ON establishments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')));
CREATE POLICY "users_insert_own" ON establishments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_pending" ON establishments FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "supervisor_admin_update" ON establishments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')));
CREATE POLICY "admin_delete" ON establishments FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Photos
CREATE POLICY "anon_active_photos" ON establishment_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM establishments e WHERE e.id = establishment_id AND e.status = 'active'));
CREATE POLICY "owner_view_photos" ON establishment_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM establishments e WHERE e.id = establishment_id AND e.user_id = auth.uid()));
CREATE POLICY "supervisor_admin_photos" ON establishment_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')));
CREATE POLICY "owner_upload" ON establishment_photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM establishments e WHERE e.id = establishment_id AND e.user_id = auth.uid()));
CREATE POLICY "owner_delete_photos" ON establishment_photos FOR DELETE
  USING (EXISTS (SELECT 1 FROM establishments e WHERE e.id = establishment_id AND e.user_id = auth.uid()));

-- Approval Logs
CREATE POLICY "supervisor_admin_insert_logs" ON approval_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')));
CREATE POLICY "admin_view_logs" ON approval_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ─── Storage: establishment-photos bucket ─────────────────────────────────
-- Run these in Supabase Dashboard > Storage > New Bucket
-- Bucket name: establishment-photos | Public: true
-- Then add these policies in Storage > Policies:
-- Allow authenticated users to upload:
--   ((bucket_id = 'establishment-photos') AND (auth.role() = 'authenticated'))
-- Allow public read:
--   (bucket_id = 'establishment-photos')
