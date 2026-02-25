/**
 * storage.js — Data layer for PMO Tracker
 * All localStorage read/write operations
 */

const DB_KEY = 'pmo_tracker_v1';

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const db = defaultDB();
      saveDB(db);
      return db;
    }
    return JSON.parse(raw);
  } catch {
    const db = defaultDB();
    saveDB(db);
    return db;
  }
}

function defaultDB() {
  return {
    records: [],
    appCreatedAt: Date.now()
  };
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ======= RECORD OPERATIONS =======

function addRecord({ date, time, tags, catatan }) {
  const db = loadDB();
  const rec = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    date,
    time,
    tags: {
      tempat: tags.tempat || '',
      waktu: tags.waktu || '',
      media: tags.media || ''
    },
    catatan: catatan || '',
    createdAt: Date.now()
  };
  db.records.push(rec);
  db.records.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  saveDB(db);
  return rec;
}

function updateRecord(id, { tags, catatan, date, time }) {
  const db = loadDB();
  const idx = db.records.findIndex(r => r.id === id);
  if (idx < 0) return null;
  db.records[idx] = {
    ...db.records[idx],
    date: date ?? db.records[idx].date,
    time: time ?? db.records[idx].time,
    tags: tags ? {
      tempat: tags.tempat !== undefined ? tags.tempat : db.records[idx].tags.tempat,
      waktu: tags.waktu !== undefined ? tags.waktu : db.records[idx].tags.waktu,
      media: tags.media !== undefined ? tags.media : db.records[idx].tags.media
    } : db.records[idx].tags,
    catatan: catatan !== undefined ? catatan : db.records[idx].catatan
  };
  saveDB(db);
  return db.records[idx];
}

function deleteRecord(id) {
  const db = loadDB();
  db.records = db.records.filter(r => r.id !== id);
  saveDB(db);
}

function getRecordsByDate(dateStr) {
  return loadDB().records.filter(r => r.date === dateStr);
}

function getAllRecords() {
  return loadDB().records;
}

function getLastRelapseTs() {
  const db = loadDB();
  if (db.records.length > 0) {
    const last = db.records[db.records.length - 1];
    return new Date(last.date + 'T' + last.time).getTime();
  }
  return null;
}

// ======= ANALYTICS =======

function getDailyCountMap() {
  const records = getAllRecords();
  const map = {};
  records.forEach(r => {
    map[r.date] = (map[r.date] || 0) + 1;
  });
  return map;
}

function getCountForDate(dateStr) {
  return getRecordsByDate(dateStr).length;
}

function getStreakRecords() {
  const records = getAllRecords();
  const db = loadDB();
  const created = new Date(db.appCreatedAt);

  if (records.length === 0) {
    const today = new Date();
    const days = Math.floor((today - created) / 86400000);
    return [{ days, label: 'Streak saat ini', startDate: fmtDate(created) }];
  }

  const streaks = [];
  const relapseDates = [...new Set(records.map(r => r.date))].sort();

  // streak before first relapse
  const firstRelapse = new Date(relapseDates[0] + 'T00:00:00');
  const daysBeforeFirst = Math.floor((firstRelapse - created) / 86400000);
  if (daysBeforeFirst > 0) {
    streaks.push({ days: daysBeforeFirst, label: 'Sebelum relaps pertama', startDate: fmtDate(created) });
  }

  // between relapses
  for (let i = 0; i < relapseDates.length - 1; i++) {
    const from = new Date(relapseDates[i] + 'T00:00:00');
    const to = new Date(relapseDates[i + 1] + 'T00:00:00');
    from.setDate(from.getDate() + 1);
    const days = Math.floor((to - from) / 86400000);
    if (days > 0) {
      streaks.push({ days, label: `${fmtDateShort(from)} – ${fmtDateShort(to)}`, startDate: fmtDate(from) });
    }
  }

  // after last relapse until today
  const lastRelapseDate = new Date(relapseDates[relapseDates.length - 1] + 'T00:00:00');
  lastRelapseDate.setDate(lastRelapseDate.getDate() + 1);
  const today = new Date();
  const currentStreak = Math.floor((today - lastRelapseDate) / 86400000);
  if (currentStreak >= 0) {
    streaks.push({ days: currentStreak, label: 'Streak saat ini', startDate: fmtDate(lastRelapseDate) });
  }

  return streaks.sort((a, b) => b.days - a.days).slice(0, 7);
}

function getChartData(mode = 'day') {
  const records = getAllRecords();
  const counts = {};

  records.forEach(r => {
    let key;
    const d = new Date(r.date + 'T00:00:00');
    if (mode === 'day') {
      key = r.date;
    } else if (mode === 'week') {
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    } else if (mode === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (mode === 'year') {
      key = `${d.getFullYear()}`;
    }
    counts[key] = (counts[key] || 0) + 1;
  });

  const sortedKeys = Object.keys(counts).sort();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  return sortedKeys.map(k => {
    let label = k;
    if (mode === 'day') {
      const d = new Date(k + 'T00:00:00');
      label = `${d.getDate()}/${d.getMonth() + 1}`;
    } else if (mode === 'month') {
      const [, m] = k.split('-');
      label = MONTHS[parseInt(m) - 1];
    }
    return { label, count: counts[k], key: k };
  }).slice(-20);
}

function getTagFrequency(type) {
  const records = getAllRecords();
  const freq = {};
  records.forEach(r => {
    const val = (r.tags[type] || '').trim();
    if (val) {
      freq[val] = (freq[val] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ======= IMPORT / EXPORT =======

function exportData() {
  const db = loadDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pmo_tracker_backup_${fmtDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.records) throw new Error('Invalid format');
        saveDB(data);
        resolve(data);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ======= DATE HELPERS =======
function fmtDate(d) {
  const dd = d instanceof Date ? d : new Date(d);
  return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`;
}
function fmtDateShort(d) {
  const dd = d instanceof Date ? d : new Date(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${dd.getDate()} ${months[dd.getMonth()]}`;
}
function todayStr() {
  return fmtDate(new Date());
}
function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

window.DB = {
  addRecord, updateRecord, deleteRecord,
  getRecordsByDate, getAllRecords,
  getLastRelapseTs,
  getDailyCountMap, getCountForDate,
  getStreakRecords, getChartData, getTagFrequency,
  exportData, importData,
  fmtDate, fmtDateShort, todayStr, nowTimeStr
};
