// script.js — QR Zanxa shared utilities

/**
 * Format status produk ke label yang readable
 */
function formatStatus(status) {
  return status === 'aktif' ? 'Aktif' : 'Tidak Aktif';
}

/**
 * Navigasi ke halaman produk
 */
function goToProduct(id) {
  window.location.href = `product.html?id=${id.trim().toUpperCase()}`;
}

/**
 * Generate QR code URL
 */
function getQRUrl(id, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=https://qr.zanxa.site/product/${id}`;
}

/**
 * Intersection observer for scroll animations
 */
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});
