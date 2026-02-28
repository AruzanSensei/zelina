/* ====================================================
   STORAGE & DATABASE
==================================================== */
const DB_KEY = 'pmotracker_v2';

function dbLoad() {
    try {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) return { records: [], createdAt: Date.now() };
        return JSON.parse(raw);
    } catch (e) {
        return { records: [], createdAt: Date.now() };
    }
}

function dbSave(db) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { }
}

const DB = {
    add(data) {
        const db = dbLoad();
        const r = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            date: data.date,
            time: data.time,
            tempat: (data.tempat || '').trim(),
            waktu: (data.waktu || '').trim(),
            media: (data.media || '').trim(),
            catatan: (data.catatan || '').trim(),
            ts: Date.now()
        };
        db.records.push(r);
        db.records.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        dbSave(db);
        return r;
    },

    edit(id, data) {
        const db = dbLoad();
        const i = db.records.findIndex(r => r.id === id);
        if (i < 0) return null;
        const o = db.records[i];
        db.records[i] = {
            ...o,
            date: data.date !== undefined ? data.date : o.date,
            time: data.time !== undefined ? data.time : o.time,
            tempat: data.tempat !== undefined ? data.tempat.trim() : o.tempat,
            waktu: data.waktu !== undefined ? data.waktu.trim() : o.waktu,
            media: data.media !== undefined ? data.media.trim() : o.media,
            catatan: data.catatan !== undefined ? data.catatan.trim() : o.catatan,
        };
        dbSave(db);
        return db.records[i];
    },

    del(id) {
        const db = dbLoad();
        db.records = db.records.filter(r => r.id !== id);
        dbSave(db);
    },

    all() { return dbLoad().records; },
    byDate(d) { return DB.all().filter(r => r.date === d); },
    countOn(d) { return DB.byDate(d).length; },
    createdAt() { return dbLoad().createdAt || Date.now(); },

    lastRelapsTs() {
        const recs = DB.all();
        if (!recs.length) return null;
        const last = recs[recs.length - 1];
        // Safari needs full ISO string — pad seconds
        return new Date(last.date + 'T' + last.time + ':00').getTime();
    },

    streaks() {
        const recs = DB.all();
        const created = new Date(DB.createdAt());
        const now = new Date();

        if (!recs.length) {
            const days = Math.max(0, Math.floor((now - created) / 86400000));
            return [{ days, label: 'Streak saat ini (sejak mulai)' }];
        }

        const res = [];
        const dates = [...new Set(recs.map(r => r.date))].sort();

        // streak before first relapse
        const first = new Date(dates[0] + 'T00:00:00');
        const dBefore = Math.floor((first - created) / 86400000);
        if (dBefore > 0) res.push({ days: dBefore, label: 'Sebelum relaps pertama' });

        // streaks between consecutive relapses
        for (let i = 0; i < dates.length - 1; i++) {
            const from = new Date(dates[i] + 'T00:00:00'); from.setDate(from.getDate() + 1);
            const to = new Date(dates[i + 1] + 'T00:00:00');
            const d = Math.floor((to - from) / 86400000);
            if (d > 0) res.push({ days: d, label: fmtShort(from) + ' — ' + fmtShort(to) });
        }

        // current streak from last relapse date
        const lastDate = new Date(dates[dates.length - 1] + 'T00:00:00');
        lastDate.setDate(lastDate.getDate() + 1);
        const cs = Math.max(0, Math.floor((now - lastDate) / 86400000));
        res.push({ days: cs, label: 'Streak saat ini' });

        return res.sort((a, b) => b.days - a.days).slice(0, 7);
    },

    chartData(mode) {
        const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const counts = {};
        DB.all().forEach(r => {
            const d = new Date(r.date + 'T00:00:00');
            let k;
            if (mode === 'day') { k = r.date; }
            else if (mode === 'week') {
                const j1 = new Date(d.getFullYear(), 0, 1);
                const wk = Math.ceil(((d - j1) / 86400000 + j1.getDay() + 1) / 7);
                k = d.getFullYear() + '-W' + pad2(wk);
            }
            else if (mode === 'month') { k = d.getFullYear() + '-' + pad2(d.getMonth() + 1); }
            else { k = String(d.getFullYear()); }
            counts[k] = (counts[k] || 0) + 1;
        });
        return Object.keys(counts).sort().slice(-20).map(k => {
            let lbl = k;
            if (mode === 'day') {
                const d = new Date(k + 'T00:00:00');
                lbl = d.getDate() + '/' + (d.getMonth() + 1);
            } else if (mode === 'month') {
                lbl = MO[parseInt(k.split('-')[1]) - 1];
            }
            return { lbl, count: counts[k] };
        });
    },

    tagFreq(field) {
        const freq = {};
        DB.all().forEach(r => {
            const v = (r[field] || '').trim();
            if (v) freq[v] = (freq[v] || 0) + 1;
        });
        return Object.entries(freq)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7);
    },

    exportBackup() {
        const db = dbLoad();
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pmo_backup_' + todayStr() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importBackup(file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data.records)) throw new Error('bad format');
                    dbSave(data);
                    resolve();
                } catch (err) { reject(err); }
            };
            fr.onerror = reject;
            fr.readAsText(file);
        });
    }
};
