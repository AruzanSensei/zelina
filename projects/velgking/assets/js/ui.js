// ─── INISIALISASI KONTEN ───
function init() {
    // Produk unggulan (6 pertama)
    document.getElementById('featuredGrid').innerHTML =
        PRODUCTS.slice(0, 6).map(p => renderProductCard(p)).join('');
    // Semua produk
    document.getElementById('produkGrid').innerHTML =
        PRODUCTS.map(p => renderProductCard(p)).join('');
    // Preview testimoni (3 pertama)
    document.getElementById('testiPreview').innerHTML =
        TESTIMONIALS.slice(0, 3).map(renderTesti).join('');
    // Semua testimoni
    document.getElementById('testiPageGrid').innerHTML =
        TESTIMONIALS.map(renderTesti).join('');
}

// ─── NAVBAR SCROLL ───
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ─── HAMBURGER MENU ───
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// ─── FILTER SIDEBAR (MOBILE) ───
function toggleFilter() {
    document.getElementById('filterSidebar').classList.toggle('open');
}

// ─── TAB SWITCHER ───
function switchTab(btn, tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ─── FAQ ACCORDION ───
function toggleFaq(el) {
    el.parentElement.classList.toggle('open');
}

// ─── BUKA WHATSAPP ───
function openWA() {
    window.open(
        'https://wa.me/6281234567890?text=Halo%20VelgKing%2C%20saya%20ingin%20konsultasi%20velg%20untuk%20mobil%20saya.',
        '_blank'
    );
}

// ─── FADE IN OBSERVER ───
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });

// ─── JALANKAN ───
init();
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
