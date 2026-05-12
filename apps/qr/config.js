// config.js — PUBLIC configuration
// File ini boleh di-commit ke git.
// JANGAN simpan SUPABASE_SERVICE_KEY di sini.
//
// SUPABASE_ANON_KEY: gunakan "Publishable key" (sb_publishable_...)
//   dari Supabase Dashboard → Settings → API Keys → Publishable key
//   BUKAN legacy "anon public" JWT (eyJhbGci...)

const APP_CONFIG = {
  SUPABASE_URL: 'https://cxtmilenczpjetlnqiwo.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_7sP5P26z9WsXGFtNdsmF6w_OH0DxQFG',
  WORKER_URL: 'https://qr-worker.zanxa-studio.workers.dev',
  STORAGE_BUCKET: 'product-images',
  APP_NAME: 'ETS Asset Tracking',
  APP_VERSION: '2.0.0',
};
