-- ═══════════════════════════════════════════════════════════════
--  Polaroid App — Supabase SQL Schema
--  Jalankan query ini di Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. TABEL USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id     TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  last_login    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk search by email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);

-- ── 2. TABEL COLLECTIONS ─────────────────────────────────────────
--
--  DESAIN UTAMA:
--  Kolom `image_urls` menyimpan SEMUA URL foto dalam SATU kolom
--  sebagai JSON array string — lebih scalable daripada banyak kolom.
--  Contoh value: '["https://...foto1.webp","https://...foto2.webp"]'
--
CREATE TABLE IF NOT EXISTS public.collections (
  id            TEXT PRIMARY KEY,                -- custom ID atau UUID
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  caption       TEXT,
  location      TEXT,
  moment_date   TEXT,                            -- tanggal momen (freeform)
  category      TEXT,                            -- travel, food, family, dll.
  visibility    TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  -- ↓ SATU KOLOM untuk semua URL foto (JSON array, comma-separated, atau apapun)
  image_urls    TEXT NOT NULL,                   -- e.g. '["url1","url2","url3"]'
  photo_count   INTEGER DEFAULT 0,
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id    ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_visibility ON public.collections(visibility);
CREATE INDEX IF NOT EXISTS idx_collections_category   ON public.collections(category);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at DESC);

-- ── 3. ROW LEVEL SECURITY (RLS) ──────────────────────────────────
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Users: service_role bisa baca/tulis semua (untuk Worker)
-- Anon hanya bisa baca profil publik
CREATE POLICY "anon_read_users" ON public.users
  FOR SELECT TO anon USING (true);

CREATE POLICY "service_all_users" ON public.users
  FOR ALL TO service_role USING (true);

-- Collections: publik bisa dibaca semua yang visibility='public'
CREATE POLICY "anon_read_public_collections" ON public.collections
  FOR SELECT TO anon
  USING (visibility = 'public');

-- Service role bisa semua (digunakan oleh Cloudflare Worker)
CREATE POLICY "service_all_collections" ON public.collections
  FOR ALL TO service_role USING (true);

-- ── 4. SUPABASE STORAGE BUCKET ───────────────────────────────────
-- Jalankan ini juga, atau buat manual di Dashboard → Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: siapapun bisa baca (public bucket)
CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'collection-images');

-- Hanya service_role yang bisa upload (melalui Worker)
CREATE POLICY "service_upload_images" ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'collection-images');

CREATE POLICY "service_delete_images" ON storage.objects
  FOR DELETE TO service_role
  USING (bucket_id = 'collection-images');

-- ── 5. FUNGSI UPDATE timestamp ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── SELESAI ───────────────────────────────────────────────────────
-- Tabel yang dibuat:
--   ✓ users          (google_id, email, name, avatar_url)
--   ✓ collections    (image_urls = satu kolom multi-URL, + metadata)
-- Storage:
--   ✓ collection-images (public bucket)
