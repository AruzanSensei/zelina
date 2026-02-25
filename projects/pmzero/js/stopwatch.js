/**
 * stopwatch.js — Real-time stopwatch engine
 * Tracks time since last PMO relapse
 */

const Stopwatch = (() => {
  let _intervalId = null;
  const _callbacks = new Set();

  function getElapsedMs() {
    const last = DB.getLastRelapseTs();
    if (!last) {
      // no relapse ever — count from app creation
      const db = JSON.parse(localStorage.getItem('pmo_tracker_v1') || '{}');
      const start = db.appCreatedAt || Date.now();
      return Date.now() - start;
    }
    return Date.now() - last;
  }

  function msToParts(ms) {
    const totalSec = Math.floor(ms / 1000);
    const sec = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const min = totalMin % 60;
    const totalHr = Math.floor(totalMin / 60);
    const hr = totalHr % 24;
    const days = Math.floor(totalHr / 24);
    return { days, hr, min, sec };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDisplay(ms) {
    const { days, hr, min, sec } = msToParts(ms);
    if (days >= 1) {
      return {
        primary: `${days}h ${pad(hr)}j`,
        secondary: `${pad(min)}m ${pad(sec)}d`,
        days, hr, min, sec
      };
    }
    return {
      primary: `${pad(hr)}:${pad(min)}`,
      secondary: `${pad(sec)} detik`,
      days, hr, min, sec
    };
  }

  function start() {
    if (_intervalId) return;
    _intervalId = setInterval(() => {
      const ms = getElapsedMs();
      const parts = msToParts(ms);
      _callbacks.forEach(cb => cb(ms, parts));
    }, 1000);
  }

  function stop() {
    clearInterval(_intervalId);
    _intervalId = null;
  }

  function onTick(cb) {
    _callbacks.add(cb);
  }

  function offTick(cb) {
    _callbacks.delete(cb);
  }

  function reset() {
    // called after relapse is added
    _callbacks.forEach(cb => cb(0, { days: 0, hr: 0, min: 0, sec: 0 }));
  }

  return { start, stop, onTick, offTick, getElapsedMs, msToParts, formatDisplay, reset, pad };
})();

window.Stopwatch = Stopwatch;
