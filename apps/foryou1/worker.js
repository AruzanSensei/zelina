/**
 * Cloudflare Worker — Polaroid App
 * Handles: Google OAuth flow, session management, Supabase API proxy
 *
 * Environment variables (set in Cloudflare dashboard):
 *   GOOGLE_CLIENT_ID      — from Google Cloud Console
 *   GOOGLE_CLIENT_SECRET  — from Google Cloud Console
 *   SUPABASE_URL          — your supabase project URL
 *   SUPABASE_SERVICE_KEY  — service role key (for server-side operations)
 *   SESSION_SECRET        — random 32-char string for signing session tokens
 *   ALLOWED_ORIGIN        — your frontend domain e.g. https://yoursite.pages.dev
 */

const GOOGLE_AUTH_URL   = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL  = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO   = 'https://www.googleapis.com/oauth2/v3/userinfo';

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(), ...headers },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',       // tighten to ALLOWED_ORIGIN in production
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Simple HMAC-SHA256 session token (base64url-encoded JSON + signature)
async function signToken(payload, secret) {
  const enc  = new TextEncoder();
  const key  = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const data = btoa(JSON.stringify(payload));
  const sig  = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return data + '.' + sigB;
}

async function verifyToken(token, secret) {
  try {
    const [data, sig] = token.split('.');
    const enc  = new TextEncoder();
    const key  = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBuf = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
    const valid  = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(data));
    if (!valid) return null;
    return JSON.parse(atob(data));
  } catch { return null; }
}

function getSessionToken(request) {
  // From Authorization header: "Bearer <token>"
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// ── Supabase REST helper ──────────────────────────────────────────────────────

async function supa(env, method, path, body = null) {
  const res = await fetch(env.SUPABASE_URL + '/rest/v1/' + path, {
    method,
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// ── Supabase Storage upload ───────────────────────────────────────────────────

async function supaUpload(env, bucket, path, blob, contentType) {
  const res = await fetch(
    env.SUPABASE_URL + '/storage/v1/object/' + bucket + '/' + path,
    {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: blob,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed: ' + res.status);
  }
  return env.SUPABASE_URL + '/storage/v1/object/public/' + bucket + '/' + path;
}

// ── Route handlers ────────────────────────────────────────────────────────────

// GET /auth/google — redirect to Google consent screen
async function handleAuthGoogle(request, env) {
  const origin    = env.ALLOWED_ORIGIN || new URL(request.url).origin;
  const redirectUri = origin + '/auth/callback';
  const params = new URLSearchParams({
    client_id:    env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  return Response.redirect(GOOGLE_AUTH_URL + '?' + params, 302);
}

// GET /auth/callback — exchange code → tokens → upsert user → issue session
async function handleAuthCallback(request, env) {
  const url    = new URL(request.url);
  const code   = url.searchParams.get('code');
  const origin = env.ALLOWED_ORIGIN || url.origin;

  if (!code) return Response.redirect(origin + '/?error=no_code', 302);

  // Exchange code for tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  origin + '/auth/callback',
      grant_type:    'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) return Response.redirect(origin + '/?error=token_failed', 302);

  // Fetch user info from Google
  const uiRes  = await fetch(GOOGLE_USERINFO, { headers: { Authorization: 'Bearer ' + tokens.access_token } });
  const gUser  = await uiRes.json();

  // Upsert user into Supabase
  const { ok, data: rows } = await supa(env, 'POST', 'users', {
    google_id:  gUser.sub,
    email:      gUser.email,
    name:       gUser.name,
    avatar_url: gUser.picture,
  });

  if (!ok) return Response.redirect(origin + '/?error=db_error', 302);

  const user = Array.isArray(rows) ? rows[0] : rows;

  // Issue session token
  const sessionToken = await signToken(
    { userId: user.id, email: user.email, name: user.name, avatar: user.avatar_url, exp: Date.now() + 7 * 86400000 },
    env.SESSION_SECRET
  );

  // Redirect to frontend with token in hash (never in query string)
  return Response.redirect(origin + '/create.html#token=' + encodeURIComponent(sessionToken), 302);
}

// GET /auth/me — validate session token, return user info
async function handleAuthMe(request, env) {
  const token = getSessionToken(request);
  if (!token) return json({ error: 'Unauthorized' }, 401);
  const session = await verifyToken(token, env.SESSION_SECRET);
  if (!session || session.exp < Date.now()) return json({ error: 'Session expired' }, 401);
  return json({ user: { id: session.userId, email: session.email, name: session.name, avatar: session.avatar } });
}

// GET /posts?page=1&limit=20&user_email=xxx — list posts
async function handleGetPosts(request, env) {
  const url   = new URL(request.url);
  const page  = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const email = url.searchParams.get('user_email');
  const offset = (page - 1) * limit;

  let path = `posts?select=*,users(id,name,email,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`;
  if (email) {
    // filter by user email via join
    path = `posts?select=*,users!inner(id,name,email,avatar_url)&users.email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=${limit}&offset=${offset}`;
  }

  const { ok, data } = await supa(env, 'GET', path);
  if (!ok) return json({ error: 'Failed to fetch posts' }, 500);
  return json(data);
}

// POST /posts — create post with images
async function handleCreatePost(request, env) {
  const token = getSessionToken(request);
  if (!token) return json({ error: 'Unauthorized' }, 401);
  const session = await verifyToken(token, env.SESSION_SECRET);
  if (!session || session.exp < Date.now()) return json({ error: 'Session expired' }, 401);

  const body = await request.json();
  const { title, description, image_urls } = body;

  if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
    return json({ error: 'At least one image required' }, 400);
  }

  // image_urls stored as PostgreSQL array in a single TEXT[] column
  const { ok, data } = await supa(env, 'POST', 'posts', {
    user_id:     session.userId,
    title:       title || '',
    description: description || '',
    image_urls:  image_urls,   // TEXT[] column — multiple URLs in one cell
  });

  if (!ok) return json({ error: 'Failed to create post', detail: data }, 500);
  return json(Array.isArray(data) ? data[0] : data, 201);
}

// POST /upload — upload image to Supabase Storage
async function handleUpload(request, env) {
  const token = getSessionToken(request);
  if (!token) return json({ error: 'Unauthorized' }, 401);
  const session = await verifyToken(token, env.SESSION_SECRET);
  if (!session || session.exp < Date.now()) return json({ error: 'Session expired' }, 401);

  const formData   = await request.formData();
  const file       = formData.get('file');
  const filename   = formData.get('filename') || 'image.webp';
  if (!file) return json({ error: 'No file' }, 400);

  const arrayBuf = await file.arrayBuffer();
  const path     = session.userId + '/' + Date.now() + '_' + filename;
  const url      = await supaUpload(env, 'post-images', path, arrayBuf, file.type || 'image/webp');

  return json({ url });
}

// GET /users/search?email=xxx — search users by email prefix
async function handleUserSearch(request, env) {
  const url   = new URL(request.url);
  const query = url.searchParams.get('email') || '';
  if (query.length < 2) return json([]);

  const { ok, data } = await supa(env, 'GET', `users?email=ilike.${encodeURIComponent('%' + query + '%')}&select=id,name,email,avatar_url&limit=10`);
  if (!ok) return json([]);
  return json(data);
}

// ── Main fetch handler ────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url      = new URL(request.url);
    const pathname = url.pathname;

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (pathname === '/auth/google' && request.method === 'GET')    return handleAuthGoogle(request, env);
    if (pathname === '/auth/callback' && request.method === 'GET')  return handleAuthCallback(request, env);
    if (pathname === '/auth/me' && request.method === 'GET')        return handleAuthMe(request, env);
    if (pathname === '/posts' && request.method === 'GET')          return handleGetPosts(request, env);
    if (pathname === '/posts' && request.method === 'POST')         return handleCreatePost(request, env);
    if (pathname === '/upload' && request.method === 'POST')        return handleUpload(request, env);
    if (pathname === '/users/search' && request.method === 'GET')   return handleUserSearch(request, env);

    return json({ error: 'Not found' }, 404);
  },
};
