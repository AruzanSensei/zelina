// ============================================================
// services/storage.js — Supabase Storage upload/delete
// Requires: config.js + auth.js loaded before this file
// ============================================================

// Compress image to WebP via Canvas API
// (dipertahankan dari create.html existing)
function compressToWebP(file, maxW = 900, maxH = 600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);

    img.onload = function () {
      URL.revokeObjectURL(objUrl);
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('canvas.toBlob gagal'));
      }, 'image/webp', quality);
    };

    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Load gambar gagal')); };
    img.src = objUrl;
  });
}

// Upload single image to Storage using admin access_token
async function uploadImage(file, nomor_seri, slot) {
  const token = await getAccessToken();
  if (!token) throw new Error('Tidak ada session aktif.');

  const blob = await compressToWebP(file, 900, 600, 0.82);
  const path = `${nomor_seri}/${slot}.webp`;

  const res = await fetch(
    `${APP_CONFIG.SUPABASE_URL}/storage/v1/object/${APP_CONFIG.STORAGE_BUCKET}/${path}`,
    {
      method: 'POST',
      headers: {
        'apikey':        APP_CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'image/webp',
        'x-upsert':      'true',
      },
      body: blob,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Upload "${slot}" gagal: ${err.message || res.status}`);
  }

  return getPublicUrl(nomor_seri, slot);
}

// Delete all images for a product (entire folder)
async function deleteProductImages(nomor_seri) {
  const token = await getAccessToken();
  if (!token) return;

  // List files in folder
  const sb = supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: files } = await sb.storage
    .from(APP_CONFIG.STORAGE_BUCKET)
    .list(nomor_seri);

  if (!files || files.length === 0) return;

  const paths = files.map(f => `${nomor_seri}/${f.name}`);
  await sb.storage.from(APP_CONFIG.STORAGE_BUCKET).remove(paths);
}

// Get public URL (no network request needed)
function getPublicUrl(nomor_seri, slot) {
  return `${APP_CONFIG.SUPABASE_URL}/storage/v1/object/public/${APP_CONFIG.STORAGE_BUCKET}/${nomor_seri}/${slot}.webp`;
}
