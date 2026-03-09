(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("contactName")?.value.trim();
    const email = document.getElementById("contactEmail")?.value.trim();
    const subject = document.getElementById("contactSubject")?.value.trim();
    const message = document.getElementById("contactMessage")?.value.trim();

    if (!name || !email || !subject || !message) return;

    const gmailUrl = new URL("https://mail.google.com/mail/");
    gmailUrl.searchParams.set("view", "cm");
    gmailUrl.searchParams.set("fs", "1");
    gmailUrl.searchParams.set("to", "alzanadytia@gmail.com");
    gmailUrl.searchParams.set("su", subject);
    gmailUrl.searchParams.set(
      "body",
      `Halo Alzan,\n\nNama: ${name}\nEmail: ${email}\n\n${message}`
    );

    window.open(gmailUrl.toString(), "_blank", "noopener");
  });
})();
