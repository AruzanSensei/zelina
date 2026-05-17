// config.js — PUBLIC configuration
// File ini boleh di-commit ke git.
// JANGAN simpan SUPABASE_SERVICE_KEY di sini.
//
// SUPABASE_ANON_KEY: gunakan "anon public" (eyJhbGci...)
//   dari Supabase Dashboard → Settings → API → Legacy API Keys
//   BUKAN "Publishable key" (sb_publishable_...) — belum kompatibel dengan PostgREST

const APP_CONFIG = {
  SUPABASE_URL: 'https://cxtmilenczpjetlnqiwo.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dG1pbGVuY3pwamV0bG5xaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTEzMTUsImV4cCI6MjA5Mjc4NzMxNX0.OpTsBgQACFzE4ipIuOiTFaf-ldscH_hnTDQdY0U52AY',
  WORKER_URL: 'https://qr-worker.zanxa-studio.workers.dev',
  STORAGE_BUCKET: 'product-images',
  APP_NAME: 'ETS Asset Tracking',
  APP_VERSION: '2.0.0',
};
