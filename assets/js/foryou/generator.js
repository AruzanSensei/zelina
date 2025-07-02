document.getElementById('foryou-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('info').innerHTML = "Permintaan kamu sedang diproses. Mohon tunggu sekitar 2 menit...";

    // Ambil data form
    const data = {
        title: document.getElementById('title').value,
        judul: document.getElementById('judul').value,
        tombol: document.getElementById('tombol').value,
        pesan: document.getElementById('pesan').value,
        nama_pengirim: document.getElementById('nama_pengirim').value,
        sublink: document.getElementById('sublink').value
    };

    // Kirim ke backend (bisa pakai GitHub API, atau endpoint serverless kamu)
    // Contoh: push ke GitHub pakai API (user harus punya token, atau pakai backend-mu)
    // Di sini hanya contoh, implementasi real perlu backend/serverless function untuk keamanan

    // Contoh fetch ke endpoint backend-mu:
    /*
    await fetch('https://your-backend-endpoint/push-foryou', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    */

    // Setelah submit, tampilkan info
    setTimeout(() => {
        document.getElementById('info').innerHTML = "Pesan kamu sedang diproses dan akan segera tersedia di: <br><b>zanxa.site/foryou/" + data.sublink + "</b><br>Silakan cek dalam 2 menit.";
    }, 2000);
});

// Auto-resize textarea pesan
const textarea = document.getElementById('pesan');
if (textarea) {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}