/* ====================================================
   HELPERS / UTILITY FUNCTIONS
==================================================== */

function pad2(n) { return String(n).padStart(2, '0'); }

function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function nowTimeStr() {
    const d = new Date();
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

function dateToStr(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function fmtFull(ds) {
    const DN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(ds + 'T00:00:00');
    return DN[d.getDay()] + ', ' + d.getDate() + ' ' + MO[d.getMonth()] + ' ' + d.getFullYear();
}

function fmtShort(d) {
    const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + MO[d.getMonth()];
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pmoClass(n) {
    if (n <= 0) return '';
    if (n === 1) return 'p1';
    if (n === 2) return 'p2';
    return 'p3';
}
