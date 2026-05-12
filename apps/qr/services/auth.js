// ============================================================
// services/auth.js — Admin Authentication
// Requires: config.js + supabase-js CDN loaded before this file
// ============================================================

let _supabase = null;

function initSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(
      APP_CONFIG.SUPABASE_URL,
      APP_CONFIG.SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

async function login(email, password) {
  const sb = initSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Verifikasi user ada di table admins
  const { data: adminRow, error: adminErr } = await sb
    .from('admins')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (adminErr || !adminRow) {
    await sb.auth.signOut();
    throw new Error('Akun ini tidak memiliki akses admin.');
  }

  return { success: true, user: data.user, role: adminRow.role };
}

async function logout() {
  const sb = initSupabase();
  await sb.auth.signOut();
  window.location.href = '../admin/login.html';
}

async function getSession() {
  const sb = initSupabase();
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function getAccessToken() {
  const session = await getSession();
  return session?.access_token ?? null;
}

let _cachedAuth = null;

async function requireAuth() {
  if (_cachedAuth) {
    const emailEl  = document.getElementById('user-email');
    const avatarEl = document.getElementById('user-avatar');
    if (emailEl)  emailEl.textContent  = _cachedAuth.email;
    if (avatarEl) avatarEl.textContent = _cachedAuth.email[0].toUpperCase();
    return _cachedAuth.sessionData;
  }

  const session = await getSession();
  if (!session) {
    window.location.href = '../admin/login.html';
    return null;
  }

  const sb = initSupabase();
  const { data: adminRow } = await sb
    .from('admins')
    .select('role, email')
    .eq('id', session.user.id)
    .single();

  if (!adminRow) {
    await sb.auth.signOut();
    window.location.href = '../admin/login.html';
    return null;
  }

  const displayEmail = adminRow.email || session.user.email;
  
  _cachedAuth = {
    email: displayEmail,
    sessionData: { user: session.user, role: adminRow.role }
  };

  // Populate topbar user info jika element ada
  const emailEl  = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  if (emailEl)  emailEl.textContent  = displayEmail;
  if (avatarEl) avatarEl.textContent = displayEmail[0].toUpperCase();

  return _cachedAuth.sessionData;
}
