-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name      TEXT,
  phone             TEXT,
  avatar_url        TEXT,
  search_radius_km  INTEGER NOT NULL DEFAULT 30,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- PETS
-- ─────────────────────────────────────────────
CREATE TABLE pets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type                  TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  species               TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  breed                 TEXT,
  colors                TEXT[] NOT NULL DEFAULT '{}',
  description           TEXT,
  name                  TEXT,
  location_lat          DOUBLE PRECISION NOT NULL,
  location_lng          DOUBLE PRECISION NOT NULL,
  location_description  TEXT NOT NULL,
  date_occurred         DATE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_delete', 'closed')),
  embedding_ready       BOOLEAN NOT NULL DEFAULT FALSE,
  embedding             VECTOR(512),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select_active"   ON pets FOR SELECT USING (status = 'active');
CREATE POLICY "pets_insert_own"      ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pets_update_own"      ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pets_delete_own"      ON pets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX pets_embedding_idx ON pets USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX pets_status_idx ON pets (status);
CREATE INDEX pets_type_idx ON pets (type);
CREATE INDEX pets_user_idx ON pets (user_id);

-- ─────────────────────────────────────────────
-- PET IMAGES
-- ─────────────────────────────────────────────
CREATE TABLE pet_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pet_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_images_select_all"  ON pet_images FOR SELECT USING (true);
CREATE POLICY "pet_images_insert_own"  ON pet_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "pet_images_delete_own"  ON pet_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- MATCHES
-- ─────────────────────────────────────────────
CREATE TABLE matches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_pet_id      UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  found_pet_id     UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  similarity_score FLOAT NOT NULL,
  distance_km      FLOAT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lost_pet_id, found_pet_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_own" ON matches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM pets WHERE id = lost_pet_id  AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM pets WHERE id = found_pet_id AND user_id = auth.uid())
  );
CREATE POLICY "matches_update_own" ON matches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM pets WHERE id = lost_pet_id  AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM pets WHERE id = found_pet_id AND user_id = auth.uid())
  );

CREATE INDEX matches_lost_idx  ON matches (lost_pet_id);
CREATE INDEX matches_found_idx ON matches (found_pet_id);
CREATE INDEX matches_status_idx ON matches (status);

-- ─────────────────────────────────────────────
-- REPORTS (content moderation)
-- ─────────────────────────────────────────────
CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id       UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  reason       TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, pet_id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_own" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ─────────────────────────────────────────────
-- STATS (anonymized counters)
-- ─────────────────────────────────────────────
CREATE TABLE stats (
  id              BIGINT PRIMARY KEY DEFAULT 1,
  reunions_count  INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO stats (id, reunions_count) VALUES (1, 0);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_select_all" ON stats FOR SELECT USING (true);

-- Increment reunions when a match is confirmed
CREATE OR REPLACE FUNCTION increment_reunions()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE stats SET reunions_count = reunions_count + 1, updated_at = NOW() WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_match_confirmed
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION increment_reunions();

-- ─────────────────────────────────────────────
-- GEOSPATIAL QUERY FUNCTION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_pets_in_radius(
  center_lat  DOUBLE PRECISION,
  center_lng  DOUBLE PRECISION,
  radius_km   INTEGER
)
RETURNS SETOF pets LANGUAGE sql STABLE AS $$
  SELECT *
  FROM pets
  WHERE
    status = 'active'
    AND (
      6371 * acos(
        LEAST(1.0,
          cos(radians(center_lat)) * cos(radians(location_lat)) *
          cos(radians(location_lng) - radians(center_lng)) +
          sin(radians(center_lat)) * sin(radians(location_lat))
        )
      )
    ) <= radius_km
  ORDER BY created_at DESC;
$$;

-- ─────────────────────────────────────────────
-- HARD DELETE after soft-delete grace period
-- Scheduled via pg_cron or Supabase Edge Function
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION purge_expired_pets()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM pets
  WHERE status = 'pending_delete'
    AND updated_at < NOW() - INTERVAL '7 days';

  DELETE FROM pets
  WHERE status = 'active'
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- ─────────────────────────────────────────────
-- ACCOUNT DELETION (callable by user)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM pets WHERE user_id = uid;
  DELETE FROM profiles WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- ─────────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "pet_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-images');

CREATE POLICY "pet_images_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "pet_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[2]
  );
