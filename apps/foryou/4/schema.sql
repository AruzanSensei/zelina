-- ═══════════════════════════════════════════════════════════════
-- SUPABASE SQL SETUP — Polaroid Gallery
-- Jalankan ini di Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Tabel USERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id     TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  last_login    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Tabel GALLERIES ────────────────────────────────────────
--
-- photo_urls disimpan sebagai TEXT[] (array teks di satu kolom)
-- → lebih scalable: bisa simpan 1 - banyak URL tanpa kolom tambahan
-- → query: SELECT unnest(photo_urls) untuk expand
--
CREATE TABLE IF NOT EXISTS galleries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email    TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  photo_urls    TEXT[] NOT NULL DEFAULT '{}',   -- ← ARRAY URL dalam 1 sel
  photo_count   INT GENERATED ALWAYS AS (array_length(photo_urls, 1)) STORED,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_galleries_user_email ON galleries(user_email);
CREATE INDEX IF NOT EXISTS idx_galleries_created_at ON galleries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── 4. TRIGGER: update updated_at ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_galleries_updated_at ON galleries;
CREATE TRIGGER trg_galleries_updated_at
  BEFORE UPDATE ON galleries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read (for search), only worker (service key) can write
CREATE POLICY "users_read_all"    ON users FOR SELECT USING (true);
CREATE POLICY "galleries_read_all" ON galleries FOR SELECT USING (true);
-- Insert/update/delete handled server-side by service key (bypasses RLS)

-- ── 6. SUPABASE STORAGE BUCKET ────────────────────────────────
-- Buat bucket bernama "product-images" di:
-- Supabase Dashboard → Storage → New Bucket
-- Nama: product-images
-- Public: ✅ (centang public)
-- File size limit: 10 MB
-- Allowed MIME types: image/*
