const form = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");

if (form && feedback) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const emailTarget = form.dataset.emailTarget || "hello@alzanadytia.com";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    feedback.className = "form-feedback";

    if (!name || !email || !message) {
      feedback.textContent = "Semua field wajib diisi sebelum pesan dikirim.";
      feedback.classList.add("is-error");
      return;
    }

    if (!emailPattern.test(email)) {
      feedback.textContent = "Format email masih belum valid.";
      feedback.classList.add("is-error");
      return;
    }

    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`);

    window.location.href = `mailto:${emailTarget}?subject=${subject}&body=${body}`;
    feedback.textContent = "Aplikasi email kamu sedang dibuka. Jika ingin pakai EmailJS, tinggal sambungkan kredensial di file form.js.";
    feedback.classList.add("is-success");
    form.reset();
  });
}
