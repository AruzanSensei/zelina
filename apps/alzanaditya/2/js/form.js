// ── CONTACT FORM ──
(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const msgEl = document.getElementById('form-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    msgEl.className = 'form-msg';

    if (!name || !email || !message) {
      msgEl.textContent = 'Semua field wajib diisi.';
      msgEl.classList.add('error');
      return;
    }
    if (!emailRx.test(email)) {
      msgEl.textContent = 'Format email tidak valid.';
      msgEl.classList.add('error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Mengirim...';

    // EmailJS integration — ganti dengan service/template ID kamu
    if (typeof emailjs !== 'undefined') {
      try {
        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { name, email, message });
        msgEl.textContent = 'Pesan berhasil dikirim! Saya akan menghubungi kamu segera.';
        msgEl.classList.add('success');
        form.reset();
      } catch(err) {
        msgEl.textContent = 'Gagal mengirim. Coba hubungi via WhatsApp.';
        msgEl.classList.add('error');
      }
    } else {
      // Fallback: mailto
      window.location.href = `mailto:alzan@email.com?subject=Pesan dari ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
      msgEl.textContent = 'Membuka aplikasi email kamu...';
      msgEl.classList.add('success');
    }
    btn.disabled = false;
    btn.textContent = 'Kirim Pesan';
  });
})();
