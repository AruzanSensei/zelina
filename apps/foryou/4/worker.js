/**
 * Cloudflare Worker — Polaroid Gallery
 * Handles: Google OAuth flow, session management, Supabase proxy
 *
 * ENVIRONMENT VARIABLES (set in Cloudflare dashboard):
 *   GOOGLE_CLIENT_ID      — from Google Cloud Console
 *   GOOGLE_CLIENT_SECRET  — from Google Cloud Console
 *   SUPABASE_URL          — your Supabase project URL
 *   SUPABASE_SERVICE_KEY  — service role key (server-side only!)
 *   SUPABASE_ANON_KEY     — anon key (safe for client)
 *   JWT_SECRET            — random string for signing session tokens
 *   ALLOWED_ORIGIN        — your frontend origin, e.g. https://yoursite.com
 *   STORAGE_BUCKET        — supabase storage bucket name, e.g. "product-images"
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonRes(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function redirect(url) {
  return Response.redirect(url, 302);
}

// Simple HMAC-SHA256 JWT (symmetric, no library needed in Workers)
async function signJWT(payload, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sigB64}`;
}

async function verifyJWT(token, secret) {
  try {
    const [header, body, sig] = token.split('.');
    const data = `${header}.${body}`;
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;
    return JSON.parse(atob(body));
  } catch { return null; }
}

async function getSession(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  return verifyJWT(match[1], env.JWT_SECRET);
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

function sbHeaders(env) {
  return {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function sbQuery(env, path, opts = {}) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: { ...sbHeaders(env), ...(opts.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN || '*';
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── OAuth: start ────────────────────────────────────────────────────────
    // GET /auth/google
    if (path === '/auth/google') {
      const state = crypto.randomUUID();
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: `${url.origin}/auth/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        state,
        prompt: 'select_account',
      });
      const res = redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
      // store state in cookie
      const r = new Response(res.body, res);
      r.headers.set('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/`);
      return r;
    }

    // ── OAuth: callback ─────────────────────────────────────────────────────
    // GET /auth/callback?code=...&state=...
    if (path === '/auth/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookieState = (request.headers.get('Cookie') || '').match(/oauth_state=([^;]+)/)?.[1];

      if (!code || state !== cookieState) {
        return new Response('Invalid OAuth state', { status: 400 });
      }

      // Exchange code for token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${url.origin}/auth/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return new Response('Token exchange failed', { status: 400 });

      // Get user info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const user = await userRes.json();

      // Upsert user in Supabase
      await sbQuery(env, '/users', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          google_id: user.sub,
          email: user.email,
          display_name: user.name,
          avatar_url: user.picture,
          last_login: new Date().toISOString(),
        }),
      });

      // Create session JWT (7 days)
      const session = await signJWT(
        { sub: user.sub, email: user.email, name: user.name, picture: user.picture, exp: Math.floor(Date.now() / 1000) + 7 * 86400 },
        env.JWT_SECRET
      );

      const frontendUrl = env.ALLOWED_ORIGIN || url.origin;
      const res = redirect(`${frontendUrl}/create.html`);
      const r = new Response(res.body, res);
      r.headers.append('Set-Cookie', `session=${session}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 86400}; Path=/`);
      r.headers.append('Set-Cookie', `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`);
      return r;
    }

    // ── Auth: me ────────────────────────────────────────────────────────────
    // GET /auth/me  → returns current session user
    if (path === '/auth/me') {
      const session = await getSession(request, env);
      if (!session) return jsonRes({ user: null }, 200, origin);
      return jsonRes({ user: session }, 200, origin);
    }

    // ── Auth: logout ────────────────────────────────────────────────────────
    if (path === '/auth/logout') {
      const res = jsonRes({ ok: true }, 200, origin);
      res.headers.set('Set-Cookie', `session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`);
      return res;
    }

    // ── API: get galleries (public) ─────────────────────────────────────────
    // GET /api/galleries?email=xxx&page=1&limit=12
    if (path === '/api/galleries' && request.method === 'GET') {
      const email = url.searchParams.get('email') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '12');
      const offset = (page - 1) * limit;

      let filter = '';
      if (email) filter = `&user_email=ilike.*${encodeURIComponent(email)}*`;

      const { ok, data } = await sbQuery(env,
        `/galleries?select=*,users(display_name,avatar_url,email)&order=created_at.desc&limit=${limit}&offset=${offset}${filter}`,
        { headers: { Prefer: 'count=exact' } }
      );

      return jsonRes(ok ? data : [], 200, origin);
    }

    // ── API: get single gallery ─────────────────────────────────────────────
    if (path.startsWith('/api/galleries/') && request.method === 'GET') {
      const id = path.split('/').pop();
      const { ok, data } = await sbQuery(env,
        `/galleries?id=eq.${id}&select=*,users(display_name,avatar_url,email)`
      );
      if (!ok || !data.length) return jsonRes({ error: 'Not found' }, 404, origin);
      return jsonRes(data[0], 200, origin);
    }

    // ── API: create gallery (requires auth) ─────────────────────────────────
    if (path === '/api/galleries' && request.method === 'POST') {
      const session = await getSession(request, env);
      if (!session) return jsonRes({ error: 'Unauthorized' }, 401, origin);

      const body = await request.json().catch(() => ({}));
      const { title, description, photo_urls } = body;

      if (!title || !photo_urls || !Array.isArray(photo_urls) || !photo_urls.length) {
        return jsonRes({ error: 'title and photo_urls[] required' }, 400, origin);
      }

      const { ok, data } = await sbQuery(env, '/galleries', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          user_email: session.email,
          title,
          description: description || null,
          // Store multiple photo URLs as PostgreSQL text array
          photo_urls, // Supabase stores this as text[]
          photo_count: photo_urls.length,
          created_at: new Date().toISOString(),
        }),
      });

      if (!ok) return jsonRes({ error: data }, 500, origin);
      return jsonRes(Array.isArray(data) ? data[0] : data, 201, origin);
    }

    // ── API: upload image to Supabase Storage ───────────────────────────────
    // POST /api/upload  (multipart: field "file", field "path")
    if (path === '/api/upload' && request.method === 'POST') {
      const session = await getSession(request, env);
      if (!session) return jsonRes({ error: 'Unauthorized' }, 401, origin);

      const form = await request.formData();
      const file = form.get('file');
      const filePath = form.get('path'); // e.g. "user@email.com/gallery-id/0.webp"

      if (!file || !filePath) return jsonRes({ error: 'file and path required' }, 400, origin);

      const uploadRes = await fetch(
        `${env.SUPABASE_URL}/storage/v1/object/${env.STORAGE_BUCKET}/${filePath}`,
        {
          method: 'POST',
          headers: {
            apikey: env.SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': file.type || 'image/webp',
            'x-upsert': 'true',
          },
          body: file,
        }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        return jsonRes({ error: err.message || 'Upload failed' }, 500, origin);
      }

      const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${env.STORAGE_BUCKET}/${filePath}`;
      return jsonRes({ url: publicUrl }, 200, origin);
    }

    // ── API: search users by email ──────────────────────────────────────────
    // GET /api/users/search?q=email
    if (path === '/api/users/search') {
      const q = url.searchParams.get('q') || '';
      if (q.length < 2) return jsonRes([], 200, origin);
      const { ok, data } = await sbQuery(env,
        `/users?email=ilike.*${encodeURIComponent(q)}*&select=email,display_name,avatar_url&limit=5`
      );
      return jsonRes(ok ? data : [], 200, origin);
    }

    // ── API: delete gallery (owner only) ────────────────────────────────────
    if (path.startsWith('/api/galleries/') && request.method === 'DELETE') {
      const session = await getSession(request, env);
      if (!session) return jsonRes({ error: 'Unauthorized' }, 401, origin);

      const id = path.split('/').pop();
      // verify ownership
      const { data } = await sbQuery(env, `/galleries?id=eq.${id}&select=user_email`);
      if (!data?.length || data[0].user_email !== session.email) {
        return jsonRes({ error: 'Forbidden' }, 403, origin);
      }

      await sbQuery(env, `/galleries?id=eq.${id}`, { method: 'DELETE' });
      return jsonRes({ ok: true }, 200, origin);
    }

    return jsonRes({ error: 'Not found' }, 404, origin);
  },
};
