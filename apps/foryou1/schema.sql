-- ═══════════════════════════════════════════════════════════════
--  SUPABASE SQL SCHEMA — Polaroid App
--  Jalankan di Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── users table ─────────────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default uuid_generate_v4(),
  google_id   text unique not null,
  email       text unique not null,
  name        text not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ── posts table ─────────────────────────────────────────────────
-- image_urls adalah TEXT[] — satu kolom menyimpan banyak URL sekaligus
create table if not exists posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references users(id) on delete cascade not null,
  title       text not null default '',
  description text,
  image_urls  text[] not null default '{}',   -- ← multiple URLs in one cell
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Indexes
create index if not exists idx_posts_user_id   on posts(user_id);
create index if not exists idx_posts_created   on posts(created_at desc);
create index if not exists idx_users_email     on users(email);
create index if not exists idx_users_google_id on users(google_id);

-- ── Row Level Security ───────────────────────────────────────────
-- Posts: anyone can read, only owner can write (enforced at Worker level anyway)
alter table posts enable row level security;
alter table users enable row level security;

-- Allow service_role (Worker) full access
create policy "service_role_posts" on posts for all using (true) with check (true);
create policy "service_role_users" on users for all using (true) with check (true);


-- ═══════════════════════════════════════════════════════════════
--  SUPABASE STORAGE — Buat bucket "post-images"
-- ═══════════════════════════════════════════════════════════════
--  Di Supabase Dashboard → Storage → New Bucket:
--    Name     : post-images
--    Public   : YES (agar URL gambar bisa diakses publik)
--
--  Atau via SQL:
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Allow public read
create policy "public_read_post_images"
  on storage.objects for select
  using ( bucket_id = 'post-images' );

-- Allow authenticated uploads (via service key from Worker)
create policy "service_upload_post_images"
  on storage.objects for insert
  using ( bucket_id = 'post-images' );
