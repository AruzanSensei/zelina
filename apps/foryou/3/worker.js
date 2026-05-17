/**
 * ══════════════════════════════════════════════════════════
 *  Polaroid Gallery — Cloudflare Worker
 *  Handles: Google OAuth 2.0 → Supabase user upsert → session
 * ══════════════════════════════════════════════════════════
 *
 *  DEPLOY STEPS:
 *  1. Install Wrangler:  npm install -g wrangler
 *  2. Login:             wrangler login
 *  3. Create project:    wrangler init polaroid-auth
 *  4. Replace this file's content into src/index.js
 *  5. Set secrets:
 *       wrangler secret put GOOGLE_CLIENT_ID
 *       wrangler secret put GOOGLE_CLIENT_SECRET
 *       wrangler secret put SUPABASE_URL
 *       wrangler secret put SUPABASE_SERVICE_KEY   ← pakai service role key, bukan anon!
 *       wrangler secret put JWT_SECRET             ← string acak untuk sign session
 *  6. Deploy:            wrangler deploy
 *  7. Update WORKER_URL di index.html & create.html dengan URL yang diberikan Wrangler
 *
 *  GOOGLE CLOUD CONSOLE:
 *  - Buat OAuth 2.0 Client ID (Web application)
 *  - Authorized redirect URIs: https://<your-worker>.workers.dev/auth/google/callback
 *
 *  SUPABASE:
 *  - Buat tabel dengan SQL di bawah (lihat bagian SQL SETUP)
 *  - Storage: buat bucket "polaroid-photos" (public)
 * ══════════════════════════════════════════════════════════
 */

// ── SQL SETUP (jalankan di Supabase SQL Editor) ─────────
/*
-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,          -- Google sub (user ID)
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_login  TIMESTAMPTZ DEFAULT now()
);

-- Tabel polaroid_posts
CREATE TABLE IF NOT EXISTS polaroid_posts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  location     TEXT,
  date_taken   TEXT,
  tags         TEXT[],                     -- array of tags
  image_urls   TEXT,                       -- JSON array string: ["url1","url2",...]
  image_count  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON polaroid_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON polaroid_posts(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE polaroid_posts ENABLE ROW LEVEL SECURITY;

-- Policy: semua bisa baca posts (galeri publik)
CREATE POLICY "posts_public_read" ON polaroid_posts
  FOR SELECT USING (true);

-- Policy: semua bisa baca users (untuk tampil di galeri)
CREATE POLICY "users_public_read" ON users
  FOR SELECT USING (true);

-- Policy: hanya service role yang bisa insert/update users & posts
-- (Worker pakai service role key, jadi ini aman)
CREATE POLICY "service_role_full" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_full_posts" ON polaroid_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Storage: buat bucket polaroid-photos (bisa lewat Dashboard atau SQL):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('polaroid-photos', 'polaroid-photos', true);
*/

// ════════════════════════════════════════════════════════
//  WORKER CODE
// ════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ── ROUTE: /auth/google ────────────────────────────
      // Redirect user ke Google OAuth consent screen
      if (pathname === '/auth/google') {
        const redirectUri = `${url.origin}/auth/google/callback`;
        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.set('client_id',     env.GOOGLE_CLIENT_ID);
        googleAuthUrl.searchParams.set('redirect_uri',  redirectUri);
        googleAuthUrl.searchParams.set('response_type', 'code');
        googleAuthUrl.searchParams.set('scope',         'openid email profile');
        googleAuthUrl.searchParams.set('access_type',   'online');
        googleAuthUrl.searchParams.set('prompt',        'select_account');

        return Response.redirect(googleAuthUrl.toString(), 302);
      }

      // ── ROUTE: /auth/google/callback ───────────────────
      // Google redirect balik ke sini dengan ?code=...
      if (pathname === '/auth/google/callback') {
        const code = url.searchParams.get('code');
        if (!code) return errorResponse('No auth code received', 400);

        const redirectUri = `${url.origin}/auth/google/callback`;

        // 1. Tukar code → access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id:     env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri:  redirectUri,
            grant_type:    'authorization_code',
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) return errorResponse('Token exchange failed: ' + JSON.stringify(tokenData), 400);

        // 2. Ambil info user dari Google
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { 'Authorization': 'Bearer ' + tokenData.access_token },
        });
        const googleUser = await userRes.json();

        if (!googleUser.sub || !googleUser.email) {
          return errorResponse('Invalid Google user data', 400);
        }

        // 3. Upsert user ke Supabase
        const userRecord = {
          id:         googleUser.sub,
          email:      googleUser.email,
          name:       googleUser.name || null,
          avatar_url: googleUser.picture || null,
          last_login: new Date().toISOString(),
        };

        const supaRes = await fetch(`${env.SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'apikey':        env.SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
            'Content-Type':  'application/json',
            'Prefer':        'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(userRecord),
        });

        if (!supaRes.ok) {
          const err = await supaRes.json().catch(() => ({}));
          console.error('Supabase upsert error:', err);
          // Lanjut meski gagal — user mungkin sudah ada
        }

        // 4. Buat session object (simple, tidak pakai JWT penuh agar ringan)
        //    Untuk production, gunakan jose / webcrypto untuk sign JWT proper
        const session = {
          user: {
            id:         googleUser.sub,
            email:      googleUser.email,
            name:       googleUser.name || null,
            avatar_url: googleUser.picture || null,
          },
          access_token: tokenData.access_token,
          expires_at:   Date.now() + (tokenData.expires_in || 3600) * 1000,
        };

        const sessionB64 = btoa(JSON.stringify(session));

        // 5. Detect origin (halaman yang request login terakhir)
        //    Redirect ke index.html dengan session di query param
        //    (Frontend akan simpan ke localStorage lalu strip dari URL)
        const appOrigin = env.APP_ORIGIN || 'http://localhost:8080';
        const redirectBack = new URL(appOrigin);
        redirectBack.searchParams.set('session', sessionB64);

        return Response.redirect(redirectBack.toString(), 302);
      }

      // ── ROUTE: /api/posts ──────────────────────────────
      // Proxy ke Supabase dengan service key (opsional, untuk future use)
      if (pathname === '/api/posts' && request.method === 'GET') {
        const limit = url.searchParams.get('limit') || '40';
        const userId = url.searchParams.get('user_id') || '';
        let supaUrl = `${env.SUPABASE_URL}/rest/v1/polaroid_posts?select=*,users(name,email,avatar_url)&order=created_at.desc&limit=${limit}`;
        if (userId) supaUrl += `&user_id=eq.${userId}`;

        const res = await fetch(supaUrl, {
          headers: {
            'apikey':        env.SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
          },
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 404 ────────────────────────────────────────────
      return new Response('Not found', { status: 404, headers: corsHeaders });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response('Internal server error: ' + err.message, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

function errorResponse(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
