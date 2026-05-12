// config.js — PUBLIC configuration
// File ini boleh di-commit ke git.
// JANGAN simpan SUPABASE_SERVICE_KEY di sini.
//
// SUPABASE_ANON_KEY: gunakan "anon public" (eyJhbGci...)
//   dari Supabase Dashboard → Settings → API → Legacy API Keys
//   BUKAN "Publishable key" (sb_publishable_...) — belum kompatibel dengan PostgREST

const APP_CONFIG = {
  SUPABASE_URL: 'https://cxtmilenczpjetlnqiwo.supabase.co',
  SUPABASE_ANON_KEY: 'GANTI_DENGAN_LEGACY_ANON_KEY_eyJhbGci...',
  WORKER_URL: 'https://qr-worker.zanxa-studio.workers.dev',
  STORAGE_BUCKET: 'product-images',
  APP_NAME: 'ETS Asset Tracking',
  APP_VERSION: '2.0.0',
};
