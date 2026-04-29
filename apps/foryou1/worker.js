/**
 * Cloudflare Worker — FULL PRODUCTION (OAuth + Upload + Posts)
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO = 'https://www.googleapis.com/oauth2/v3/userinfo';

// ── CORS ─────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://foryou1.zanxa.site',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

// ── TOKEN ────────────────────────
async function signToken(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  const data = btoa(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB = btoa(String.fromCharCode(...new Uint8Array(sig)));

  return data + '.' + sigB;
}

async function verifyToken(token, secret) {
  try {
    const [data, sig] = token.split('.');
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );

    const sigBuf = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(data));

    if (!valid) return null;
    const payload = JSON.parse(atob(data));
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch { return null; }
}

// ── MAIN ─────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (path === '/auth/google') return handleAuthGoogle(env);
    if (path === '/auth/callback') return handleAuthCallback(request, env);
    if (path === '/auth/me') return handleAuthMe(request, env);

    if (path === '/upload' && request.method === 'POST') return handleUpload(request, env);
    if (path === '/posts' && request.method === 'POST') return handleCreatePost(request, env);
    if (path === '/posts' && request.method === 'GET') return handleGetPosts(request, env);

    return json({ error: 'Not found' }, 404);
  }
};

// ── AUTH ─────────────────────────
function handleAuthGoogle(env) {
  const redirectUri = 'https://foryou1.zanxa-studio.workers.dev/auth/callback';

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  });

  return Response.redirect(`${GOOGLE_AUTH_URL}?${params}`, 302);
}

async function handleAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const redirectUri = 'https://foryou1.zanxa-studio.workers.dev/auth/callback';

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const token = await tokenRes.json();

  const userRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const gUser = await userRes.json();

  const sessionToken = await signToken({
    email: gUser.email,
    name: gUser.name,
    avatar: gUser.picture,
    exp: Date.now() + 7 * 86400000
  }, env.SESSION_SECRET);

  return Response.redirect(
    `https://foryou1.zanxa.site/create.html#token=${encodeURIComponent(sessionToken)}`,
    302
  );
}

async function handleAuthMe(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

  const session = await verifyToken(auth.slice(7), env.SESSION_SECRET);
  if (!session) return json({ error: 'Invalid session' }, 401);

  return json({ user: session });
}

// ── UPLOAD ───────────────────────
async function handleUpload(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const session = await verifyToken(auth.slice(7), env.SESSION_SECRET);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const form = await request.formData();
  const file = form.get('file');

  const arrayBuffer = await file.arrayBuffer();
  const path = `${Date.now()}.webp`;

  const res = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/post-images/${path}`,
    {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: arrayBuffer
    }
  );

  if (!res.ok) return json({ error: 'Upload gagal' }, 500);

  const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/post-images/${path}`;
  return json({ url: publicUrl });
}

// ── CREATE POST ──────────────────
async function handleCreatePost(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const session = await verifyToken(auth.slice(7), env.SESSION_SECRET);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const body = await request.json();

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/posts`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      title: body.title,
      description: body.description,
      image_urls: body.image_urls
    })
  });

  const data = await res.json();
  return json(data);
}

// ── GET POSTS ────────────────────
async function handleGetPosts(request, env) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/posts?select=*,users(name,email,avatar_url)&order=created_at.desc`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    }
  );

  const data = await res.json();
  return json(data);
}