(function() {
    var pass = sessionStorage.getItem('contact_pass');
    if (pass !== '14012007') {
        var input = prompt('Masukkan sandi angka 8 digit untuk mengakses halaman ini:');
        if (input !== '14012007') {
            alert('Sandi salah!');
            window.location.href = 'https://zanxa.site/foryou';
        } else {
            sessionStorage.setItem('contact_pass', '14012007');
        }
    }
})();