/**
 * ═══════════════════════════════════════════════════════════════
 *  Polaroid — Cloudflare Worker
 *  Handles: Google OAuth, session management, collection CRUD
 * ═══════════════════════════════════════════════════════════════
 *
 *  Environment Variables (set di Cloudflare Dashboard → Workers → Settings → Variables):
 *  ┌─────────────────────────┬──────────────────────────────────────────────┐
 *  │ GOOGLE_CLIENT_ID        │ Dari Google Cloud Console OAuth 2.0          │
 *  │ GOOGLE_CLIENT_SECRET    │ Dari Google Cloud Console OAuth 2.0          │
 *  │ SUPABASE_URL            │ https://xxxx.supabase.co                     │
 *  │ SUPABASE_SERVICE_KEY    │ service_role key (bukan anon key!)           │
 *  │ SESSION_SECRET          │ String acak panjang untuk sign JWT session   │
 *  │ FRONTEND_URL            │ URL frontend kamu (untuk CORS & redirect)    │
 *  └─────────────────────────┴──────────────────────────────────────────────┘
 */

// ─────────────────────────────────────────────────────────────────
//  CORS HEADERS
// ─────────────────────────────────────────────────────────────────
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonResponse(data, status = 200, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

function errorResponse(message, status = 400, env) {
  return jsonResponse({ error: true, message }, status, env);
}

// ─────────────────────────────────────────────────────────────────
//  SIMPLE JWT-LIKE SESSION (HMAC-SHA256)
//  Menggunakan Web Crypto API yang tersedia di Cloudflare Workers
// ─────────────────────────────────────────────────────────────────
async function signToken(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const data = btoa(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return data + '.' + sigB64;
}

async function verifyToken(token, secret) {
  try {
    const [data, sig] = token.split('.');
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );
    const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
    if (!valid) return null;
    const payload = JSON.parse(atob(data));
    // Cek expiry
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
//  SUPABASE HELPERS
// ─────────────────────────────────────────────────────────────────
async function supabaseQuery(env, path, options = {}) {
  const url = env.SUPABASE_URL + '/rest/v1' + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// ─────────────────────────────────────────────────────────────────
//  AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────────
async function getSession(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  return await verifyToken(token, env.SESSION_SECRET);
}

// ─────────────────────────────────────────────────────────────────
//  MAIN HANDLER
// ─────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Preflight CORS
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    // ── ROUTES ────────────────────────────────────────────────────
    try {
      // ── GET /auth/google — Redirect ke Google OAuth ──────────
      if (path === '/auth/google' && method === 'GET') {
        const redirectAfter = url.searchParams.get('redirect') || env.FRONTEND_URL;
        const state = btoa(JSON.stringify({ redirect: redirectAfter, nonce: crypto.randomUUID() }));

        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
        googleAuthUrl.searchParams.set('redirect_uri', `${url.origin}/auth/google/callback`);
        googleAuthUrl.searchParams.set('response_type', 'code');
        googleAuthUrl.searchParams.set('scope', 'openid email profile');
        googleAuthUrl.searchParams.set('state', state);
        googleAuthUrl.searchParams.set('access_type', 'online');
        googleAuthUrl.searchParams.set('prompt', 'select_account');

        return Response.redirect(googleAuthUrl.toString(), 302);
      }

      // ── GET /auth/google/callback — Handle OAuth callback ────
      if (path === '/auth/google/callback' && method === 'GET') {
        const code = url.searchParams.get('code');
        const stateRaw = url.searchParams.get('state');
        if (!code) return errorResponse('Missing OAuth code', 400, env);

        let redirectAfter = env.FRONTEND_URL;
        try {
          const stateObj = JSON.parse(atob(stateRaw || ''));
          redirectAfter = stateObj.redirect || env.FRONTEND_URL;
        } catch {}

        // Exchange code → access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${url.origin}/auth/google/callback`,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          return Response.redirect(redirectAfter + '?error=oauth_failed', 302);
        }

        // Ambil profil user dari Google
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': 'Bearer ' + tokenData.access_token },
        });
        const profile = await profileRes.json();

        // Upsert user ke Supabase
        const upsertRes = await supabaseQuery(env,
          '/users?on_conflict=google_id',
          {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify({
              google_id: profile.id,
              email: profile.email,
              name: profile.name,
              avatar_url: profile.picture,
              last_login: new Date().toISOString(),
            }),
          }
        );

        if (!upsertRes.ok) {
          console.error('Upsert user failed:', upsertRes.data);
          return Response.redirect(redirectAfter + '?error=db_error', 302);
        }

        const userData = Array.isArray(upsertRes.data) ? upsertRes.data[0] : upsertRes.data;

        // Buat session token (7 hari)
        const sessionToken = await signToken({
          sub: userData.id,
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatar_url,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
        }, env.SESSION_SECRET);

        // Redirect ke frontend dengan session token
        const finalUrl = new URL(redirectAfter);
        finalUrl.searchParams.set('session_token', sessionToken);
        return Response.redirect(finalUrl.toString(), 302);
      }

      // ── GET /auth/me — Get current user info ─────────────────
      if (path === '/auth/me' && method === 'GET') {
        const session = await getSession(request, env);
        if (!session) return errorResponse('Unauthorized', 401, env);

        // Ambil data terbaru dari DB
        const res = await supabaseQuery(env, `/users?id=eq.${session.sub}&select=*`);
        if (!res.ok || !res.data?.length) return errorResponse('User not found', 404, env);

        return jsonResponse(res.data[0], 200, env);
      }

      // ── POST /collections — Create new collection ─────────────
      if (path === '/collections' && method === 'POST') {
        const session = await getSession(request, env);
        if (!session) return errorResponse('Login required', 401, env);

        const body = await request.json();

        // Validasi minimal
        if (!body.title || !body.image_urls) {
          return errorResponse('title dan image_urls wajib diisi', 400, env);
        }

        const payload = {
          id: body.id || crypto.randomUUID(),
          user_id: session.sub,
          title: body.title,
          caption: body.caption || null,
          location: body.location || null,
          moment_date: body.moment_date || null,
          category: body.category || null,
          visibility: body.visibility || 'public',
          // ← Satu kolom menyimpan semua URL sebagai JSON array string
          image_urls: typeof body.image_urls === 'string'
            ? body.image_urls
            : JSON.stringify(body.image_urls),
          photo_count: body.photo_count || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const res = await supabaseQuery(env, '/collections', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          return errorResponse(res.data?.message || 'Gagal menyimpan koleksi', 500, env);
        }

        return jsonResponse(
          Array.isArray(res.data) ? res.data[0] : res.data,
          201, env
        );
      }

      // ── GET /collections — List all public collections ────────
      if (path === '/collections' && method === 'GET') {
        const emailFilter = url.searchParams.get('email');
        const category = url.searchParams.get('category');
        const since = url.searchParams.get('since'); // ISO date
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let query = `/collections?select=*,users(id,name,email,avatar_url)&visibility=eq.public&order=created_at.desc&limit=${limit}&offset=${offset}`;

        if (category) query += `&category=eq.${encodeURIComponent(category)}`;
        if (since) query += `&created_at=gte.${encodeURIComponent(since)}`;
        if (emailFilter) {
          // Filter by user email (join)
          query = `/collections?select=*,users!inner(id,name,email,avatar_url)&visibility=eq.public&users.email=eq.${encodeURIComponent(emailFilter)}&order=created_at.desc&limit=${limit}&offset=${offset}`;
        }

        const res = await supabaseQuery(env, query);
        if (!res.ok) return errorResponse('Gagal memuat koleksi', 500, env);

        return jsonResponse(res.data || [], 200, env);
      }

      // ── GET /collections/:id — Get single collection ──────────
      if (path.startsWith('/collections/') && method === 'GET') {
        const id = path.replace('/collections/', '');
        const session = await getSession(request, env);

        let query = `/collections?id=eq.${id}&select=*,users(id,name,email,avatar_url)`;

        const res = await supabaseQuery(env, query);
        if (!res.ok || !res.data?.length) return errorResponse('Koleksi tidak ditemukan', 404, env);

        const col = res.data[0];
        // Kalau private, hanya pemilik yang bisa lihat
        if (col.visibility === 'private') {
          if (!session || session.sub !== col.user_id) {
            return errorResponse('Akses ditolak', 403, env);
          }
        }

        return jsonResponse(col, 200, env);
      }

      // ── DELETE /collections/:id — Delete collection ───────────
      if (path.startsWith('/collections/') && method === 'DELETE') {
        const session = await getSession(request, env);
        if (!session) return errorResponse('Login required', 401, env);

        const id = path.replace('/collections/', '');

        // Cek kepemilikan
        const check = await supabaseQuery(env, `/collections?id=eq.${id}&select=user_id`);
        if (!check.ok || !check.data?.length) return errorResponse('Koleksi tidak ditemukan', 404, env);
        if (check.data[0].user_id !== session.sub) return errorResponse('Akses ditolak', 403, env);

        const res = await supabaseQuery(env, `/collections?id=eq.${id}`, { method: 'DELETE' });
        if (!res.ok) return errorResponse('Gagal menghapus', 500, env);

        return jsonResponse({ success: true }, 200, env);
      }

      // ── GET /users/search?email=... — Search user by email ───
      if (path === '/users/search' && method === 'GET') {
        const q = url.searchParams.get('email') || '';
        if (!q || q.length < 3) return jsonResponse([], 200, env);

        const res = await supabaseQuery(env,
          `/users?select=id,name,email,avatar_url&email=ilike.*${encodeURIComponent(q)}*&limit=10`
        );

        return jsonResponse(res.data || [], 200, env);
      }

      // ── 404 ───────────────────────────────────────────────────
      return errorResponse('Route tidak ditemukan', 404, env);

    } catch (err) {
      console.error('Worker error:', err);
      return errorResponse('Internal server error: ' + err.message, 500, env);
    }
  }
};
