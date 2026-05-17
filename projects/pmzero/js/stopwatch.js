/* ====================================================
   STOPWATCH ENGINE
==================================================== */
const SW = (() => {
    let _tid = null;
    let _cbs = [];
    let _cached = 0;       // cached elapsed for current second

    function calcMs() {
        const ref = DB.lastRelapsTs() || DB.createdAt();
        return Math.max(0, Date.now() - ref);
    }

    function decompose(ms) {
        const totalSec = Math.floor(ms / 1000);
        const sec = totalSec % 60;
        const totalMin = Math.floor(totalSec / 60);
        const min = totalMin % 60;
        const totalHr = Math.floor(totalMin / 60);
        const hr = totalHr % 24;
        const days = Math.floor(totalHr / 24);
        return { days, hr, min, sec };
    }

    function tick() {
        _cached = calcMs();
        const p = decompose(_cached);
        _cbs.forEach(fn => { try { fn(p); } catch (e) { } });
    }

    function start() {
        if (_tid) return;
        tick(); // immediate first tick
        _tid = setInterval(tick, 1000);
    }

    function onTick(fn) { _cbs.push(fn); }

    function getMs() { return calcMs(); }
    function getParts() { return decompose(calcMs()); }

    return { start, onTick, getMs, getParts };
})();
