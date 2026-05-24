/**
 * supabase.js — BME SaaS Client Bridge
 *
 * Tanggung jawab file ini (HANYA):
 *  1. Inisialisasi Supabase Auth di browser (pakai ANON_KEY — aman untuk publik)
 *  2. Menyediakan helper login Google OAuth & Email/Password
 *  3. Memanggil Edge Functions di server via fetch() dengan JWT token
 *
 * CATATAN KEAMANAN:
 *  - SUPABASE_SERVICE_ROLE_KEY TIDAK ADA di file ini.
 *  - SERVICE_ROLE_KEY hanya ada di dalam Edge Functions yang berjalan di server Supabase.
 *  - File ini hanya memegang ANON_KEY (kunci publik, aman di browser).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================
// KONFIGURASI — Isi setelah deploy Supabase project Anda
// Ambil dari: Dashboard Supabase → Project Settings → API
// ============================================================
const SUPABASE_URL = 'https://qydhvqhkmmrfizawfgvx.supabase.co';  // ← Ganti ini
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZGh2cWhrbW1yZml6YXdmZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDcwMDgsImV4cCI6MjA5NTEyMzAwOH0.YEtleS0eRXrX15xKHyMWf5uC5AHFOb0_5CALnVt3OAQ';              // ← Ganti ini

// ============================================================
// Inisialisasi Supabase Client (hanya untuk Auth/OAuth)
// ============================================================
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// URL Edge Functions (server-side — tidak menyentuh browser)
// ============================================================
const EDGE_VALIDATE_ADMIN = `${SUPABASE_URL}/functions/v1/validate-admin`;
const EDGE_USER_DATA = `${SUPABASE_URL}/functions/v1/user-data-proxy`;

// ============================================================
// AUTH: Login Google OAuth
// ============================================================
/**
 * Memulai alur login Google OAuth.
 * Setelah login berhasil, Supabase akan redirect ke halaman ini
 * dengan session yang bisa diambil via onAuthStateChange.
 */
export async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.href
        }
    });
    if (error) throw new Error(error.message);
}

// ============================================================
// AUTH: Login Email & Password
// ============================================================
/**
 * Login menggunakan email dan password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{session: object, user: object}>}
 */
export async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
}

// ============================================================
// AUTH: Logout
// ============================================================
/**
 * Mengakhiri sesi Supabase di browser.
 */
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}

// ============================================================
// AUTH: Session Listener (untuk handle OAuth redirect callback)
// ============================================================
/**
 * Mendaftarkan listener perubahan status autentikasi.
 * Dipanggil otomatis saat halaman dimuat setelah redirect OAuth.
 * @param {Function} callback - fn(event, session)
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}

/**
 * Mengambil session aktif saat ini (jika ada).
 * @returns {Promise<object|null>} session atau null
 */
export async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
}

// ============================================================
// SERVER CALL: Validasi Admin via Edge Function
// ============================================================
/**
 * Memverifikasi apakah user yang login terdaftar sebagai admin
 * di tabel allowed_admins (dilakukan di server, bukan browser).
 *
 * @param {string} accessToken - JWT access token dari sesi Supabase
 * @returns {Promise<{isAdmin: boolean, user: object}>}
 * @throws {Error} dengan message '403' jika bukan admin
 */
export async function validateAdminServer(accessToken) {
    const response = await fetch(EDGE_VALIDATE_ADMIN, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 403) {
        throw new Error('403');
    }

    if (!response.ok) {
        throw new Error(`Validasi admin gagal: ${response.status}`);
    }

    return await response.json(); // { isAdmin: true, user: {...} }
}

// ============================================================
// SERVER CALL: Load Data dari Cloud (via Edge Function)
// ============================================================
/**
 * Mengambil data transaksi user dari Supabase (melalui server proxy).
 * Aman karena akses database terjadi di server menggunakan SERVICE_ROLE_KEY.
 *
 * @param {string} accessToken - JWT access token dari sesi Supabase
 * @returns {Promise<{settings, history, templates, tabs}|null>}
 */
export async function loadUserData(accessToken) {
    const response = await fetch(EDGE_USER_DATA, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 403) {
        throw new Error('403');
    }

    if (!response.ok) {
        throw new Error(`Gagal memuat data cloud: ${response.status}`);
    }

    const data = await response.json();
    // Jika belum ada data di cloud, return null agar client tahu
    if (!data || Object.keys(data).length === 0) return null;
    return data;
}

// ============================================================
// SERVER CALL: Simpan Data ke Cloud (via Edge Function)
// ============================================================
/**
 * Menyimpan (upsert) data transaksi user ke Supabase (melalui server proxy).
 * Aman karena akses database terjadi di server menggunakan SERVICE_ROLE_KEY.
 *
 * @param {string} accessToken - JWT access token dari sesi Supabase
 * @param {{ settings, history, templates, tabs }} data - Data yang akan disimpan
 * @returns {Promise<boolean>} true jika berhasil
 */
export async function saveUserData(accessToken, data) {
    const response = await fetch(EDGE_USER_DATA, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        console.error('[supabase.js] saveUserData failed:', response.status);
        return false;
    }

    return true;
}

// ============================================================
// COMPATIBILITY EXPORTS FOR APP.JS
// ============================================================
export function getSupabase() {
    return supabase;
}

export async function fetchUserData(accessToken) {
    return await loadUserData(accessToken);
}
