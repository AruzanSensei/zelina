// app.js — State & Router

let appState = {
  role: null, // 'guru' | 'murid'
  page: null,
  quizState: null,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDate(d) {
  if (!d) return '-';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
}

function navigate(page, data = {}) {
  appState.page = page;
  appState.pageData = data;
  renderContent();
  // Highlight sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

function setRole(role) {
  appState.role = role;
  document.getElementById('landing').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  renderSidebar();
  const defaultPage = role === 'guru' ? 'overview' : 'murid-dashboard';
  navigate(defaultPage);
}

// ───────────────────────────────────────────────────────
// SIDEBAR
// ───────────────────────────────────────────────────────
function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const roleLabel = document.getElementById('role-label');
  const roleIcon = document.getElementById('role-icon');

  const guruMenu = [
    { page: 'overview', icon: '◈', label: 'Overview' },
    { page: 'ujian', icon: '◉', label: 'Ujian' },
    { page: 'soal', icon: '◎', label: 'Soal' },
    { page: 'nilai', icon: '◆', label: 'Nilai' },
    { page: 'absensi', icon: '◇', label: 'Absensi' },
    { page: 'siswa', icon: '◯', label: 'Data Siswa' },
  ];
  const muridMenu = [
    { page: 'murid-dashboard', icon: '◈', label: 'Dashboard' },
    { page: 'daftar-ujian', icon: '◉', label: 'Daftar Ujian' },
    { page: 'nilai-saya', icon: '◆', label: 'Nilai Saya' },
  ];

  const menu = appState.role === 'guru' ? guruMenu : muridMenu;
  roleLabel.textContent = appState.role === 'guru' ? 'Mode Guru' : 'Mode Murid';
  roleIcon.textContent = appState.role === 'guru' ? '🎓' : '📚';

  nav.innerHTML = menu.map(m => `
    <li class="nav-item ${appState.page === m.page ? 'active' : ''}" data-page="${m.page}">
      <span class="nav-icon">${m.icon}</span>
      <span>${m.label}</span>
    </li>
  `).join('');

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
}

// ───────────────────────────────────────────────────────
// CONTENT ROUTER
// ───────────────────────────────────────────────────────
function renderContent() {
  const main = document.getElementById('main-content');
  const pageTitle = document.getElementById('page-title');

  const titles = {
    'overview': 'Overview', 'ujian': 'Manajemen Ujian', 'soal': 'Bank Soal',
    'nilai': 'Rekap Nilai', 'absensi': 'Absensi', 'siswa': 'Data Siswa',
    'murid-dashboard': 'Dashboard', 'daftar-ujian': 'Daftar Ujian',
    'nilai-saya': 'Nilai Saya', 'kerjakan-ujian': 'Kerjakan Ujian',
  };
  pageTitle.textContent = titles[appState.page] || '';

  const pages = {
    'overview': renderOverview,
    'ujian': renderUjian,
    'soal': renderSoal,
    'nilai': renderNilai,
    'absensi': renderAbsensi,
    'siswa': renderSiswa,
    'murid-dashboard': renderMuridDashboard,
    'daftar-ujian': renderDaftarUjian,
    'nilai-saya': renderNilaiSaya,
    'kerjakan-ujian': renderKerjakanUjian,
  };

  main.innerHTML = '';
  if (pages[appState.page]) pages[appState.page](main);
}

// ───────────────────────────────────────────────────────
// OVERVIEW (GURU)
// ───────────────────────────────────────────────────────
function renderOverview(el) {
  const students = Storage.get('students');
  const exams = Storage.get('exams');
  const scores = Storage.get('scores');
  const avgScore = scores.length ? Math.round(scores.reduce((s, sc) => s + sc.score, 0) / scores.length) : 0;
  const activeExams = exams.filter(e => e.status === 'active').length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-body">
          <div class="stat-num">${students.length}</div>
          <div class="stat-label">Total Siswa</div>
        </div>
      </div>
      <div class="stat-card accent-2">
        <div class="stat-icon">📋</div>
        <div class="stat-body">
          <div class="stat-num">${exams.length}</div>
          <div class="stat-label">Total Ujian</div>
        </div>
      </div>
      <div class="stat-card accent-3">
        <div class="stat-icon">✅</div>
        <div class="stat-body">
          <div class="stat-num">${activeExams}</div>
          <div class="stat-label">Ujian Aktif</div>
        </div>
      </div>
      <div class="stat-card accent-4">
        <div class="stat-icon">🏆</div>
        <div class="stat-body">
          <div class="stat-num">${avgScore}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>
    </div>

    <div class="section-grid">
      <div class="card">
        <div class="card-header"><h3>Ujian Terbaru</h3></div>
        <table class="data-table">
          <thead><tr><th>Nama Ujian</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>
            ${exams.slice(0, 5).map(e => `
              <tr>
                <td>${e.title}</td>
                <td>${formatDate(e.date)}</td>
                <td><span class="badge badge-${e.status}">${e.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-header"><h3>Nilai Terbaru</h3></div>
        <table class="data-table">
          <thead><tr><th>Siswa</th><th>Nilai</th><th>Tanggal</th></tr></thead>
          <tbody>
            ${scores.slice(-5).reverse().map(sc => `
              <tr>
                <td>${sc.studentName}</td>
                <td><span class="score-pill ${sc.score >= 75 ? 'pass' : 'fail'}">${sc.score}</span></td>
                <td>${formatDate(sc.date)}</td>
              </tr>
            `).join('')}
            ${!scores.length ? '<tr><td colspan="3" class="empty-row">Belum ada nilai</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ───────────────────────────────────────────────────────
// UJIAN (GURU)
// ───────────────────────────────────────────────────────
function renderUjian(el) {
  const exams = Storage.get('exams');
  el.innerHTML = `
    <div class="page-actions">
      <button class="btn btn-primary" id="btn-add-exam">＋ Tambah Ujian</button>
    </div>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>Judul</th><th>Mata Pelajaran</th><th>Tanggal</th><th>Durasi</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          ${exams.map(e => `
            <tr>
              <td><strong>${e.title}</strong></td>
              <td>${e.subject || '-'}</td>
              <td>${formatDate(e.date)}</td>
              <td>${e.duration} menit</td>
              <td><span class="badge badge-${e.status}">${e.status}</span></td>
              <td class="action-cell">
                <button class="btn-icon" onclick="editExam('${e.id}')">✏️</button>
                <button class="btn-icon btn-del" onclick="deleteExam('${e.id}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
          ${!exams.length ? '<tr><td colspan="6" class="empty-row">Belum ada ujian</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('btn-add-exam').addEventListener('click', () => showExamModal());
}

function showExamModal(exam = null) {
  const isEdit = !!exam;
  showModal(`
    <h2>${isEdit ? 'Edit Ujian' : 'Tambah Ujian Baru'}</h2>
    <div class="form-group">
      <label>Judul Ujian</label>
      <input id="f-title" class="form-input" value="${exam?.title || ''}" placeholder="Contoh: Matematika Bab 1">
    </div>
    <div class="form-group">
      <label>Mata Pelajaran</label>
      <input id="f-subject" class="form-input" value="${exam?.subject || ''}" placeholder="Contoh: Matematika">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tanggal</label>
        <input id="f-date" type="date" class="form-input" value="${exam?.date || ''}">
      </div>
      <div class="form-group">
        <label>Durasi (menit)</label>
        <input id="f-duration" type="number" class="form-input" value="${exam?.duration || 60}" min="5">
      </div>
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="f-status" class="form-input">
        <option value="draft" ${exam?.status === 'draft' ? 'selected' : ''}>Draft</option>
        <option value="active" ${exam?.status === 'active' ? 'selected' : ''}>Active</option>
        <option value="finished" ${exam?.status === 'finished' ? 'selected' : ''}>Finished</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveExam('${exam?.id || ''}')">Simpan</button>
    </div>
  `);
}

window.saveExam = function(id) {
  const title = document.getElementById('f-title').value.trim();
  const subject = document.getElementById('f-subject').value.trim();
  const date = document.getElementById('f-date').value;
  const duration = parseInt(document.getElementById('f-duration').value);
  const status = document.getElementById('f-status').value;
  if (!title || !date) return toast('Judul dan tanggal wajib diisi', 'error');
  const exams = Storage.get('exams');
  if (id) {
    const i = exams.findIndex(e => e.id === id);
    if (i > -1) exams[i] = { ...exams[i], title, subject, date, duration, status };
  } else {
    exams.push({ id: 'e' + uid(), title, subject, date, duration, status });
  }
  Storage.set('exams', exams);
  closeModal();
  toast(id ? 'Ujian diperbarui' : 'Ujian ditambahkan');
  navigate('ujian');
};

window.editExam = function(id) {
  const exam = Storage.get('exams').find(e => e.id === id);
  if (exam) showExamModal(exam);
};

window.deleteExam = function(id) {
  if (!confirm('Hapus ujian ini?')) return;
  Storage.set('exams', Storage.get('exams').filter(e => e.id !== id));
  Storage.set('questions', Storage.get('questions').filter(q => q.examId !== id));
  toast('Ujian dihapus');
  navigate('ujian');
};

// ───────────────────────────────────────────────────────
// SOAL (GURU)
// ───────────────────────────────────────────────────────
function renderSoal(el) {
  const exams = Storage.get('exams');
  const questions = Storage.get('questions');
  const selectedExam = appState.pageData?.examId || (exams[0]?.id || '');

  el.innerHTML = `
    <div class="page-actions">
      <select id="exam-filter" class="form-input" style="max-width:280px">
        <option value="">-- Pilih Ujian --</option>
        ${exams.map(e => `<option value="${e.id}" ${e.id === selectedExam ? 'selected' : ''}>${e.title}</option>`).join('')}
      </select>
      <button class="btn btn-primary" id="btn-add-q">＋ Tambah Soal</button>
    </div>
    <div id="q-list">
      ${renderQuestionList(questions, selectedExam)}
    </div>
  `;

  document.getElementById('exam-filter').addEventListener('change', function() {
    appState.pageData = { examId: this.value };
    document.getElementById('q-list').innerHTML = renderQuestionList(Storage.get('questions'), this.value);
  });

  document.getElementById('btn-add-q').addEventListener('click', () => {
    const eid = document.getElementById('exam-filter').value;
    if (!eid) return toast('Pilih ujian terlebih dahulu', 'error');
    showQuestionModal(null, eid);
  });
}

function renderQuestionList(questions, examId) {
  const filtered = examId ? questions.filter(q => q.examId === examId) : [];
  if (!examId) return `<div class="empty-state">Pilih ujian untuk melihat soal</div>`;
  if (!filtered.length) return `<div class="empty-state">Belum ada soal untuk ujian ini</div>`;
  return filtered.map((q, i) => `
    <div class="q-card">
      <div class="q-header">
        <span class="q-num">Soal ${i + 1}</span>
        <div>
          <button class="btn-icon" onclick="editQuestion('${q.id}')">✏️</button>
          <button class="btn-icon btn-del" onclick="deleteQuestion('${q.id}')">🗑️</button>
        </div>
      </div>
      <div class="q-text">${q.question}</div>
      <div class="q-options">
        ${q.options.map((opt, idx) => `
          <div class="q-opt ${idx === q.correctAnswer ? 'correct' : ''}">
            <span class="opt-label">${String.fromCharCode(65 + idx)}</span> ${opt}
            ${idx === q.correctAnswer ? '<span class="correct-tag">✓ Benar</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function showQuestionModal(q = null, examId = '') {
  const isEdit = !!q;
  showModal(`
    <h2>${isEdit ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
    <div class="form-group">
      <label>Pertanyaan</label>
      <textarea id="f-q" class="form-input" rows="3" placeholder="Tulis pertanyaan di sini...">${q?.question || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Pilihan Jawaban</label>
      ${[0,1,2,3].map(i => `
        <div class="opt-row">
          <span class="opt-lbl">${String.fromCharCode(65+i)}</span>
          <input id="f-opt-${i}" class="form-input" value="${q?.options?.[i] || ''}" placeholder="Pilihan ${String.fromCharCode(65+i)}">
        </div>
      `).join('')}
    </div>
    <div class="form-group">
      <label>Jawaban Benar</label>
      <select id="f-correct" class="form-input">
        ${[0,1,2,3].map(i => `<option value="${i}" ${q?.correctAnswer === i ? 'selected' : ''}>${String.fromCharCode(65+i)}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveQuestion('${q?.id || ''}', '${q?.examId || examId}')">Simpan</button>
    </div>
  `);
}

window.saveQuestion = function(id, examId) {
  const question = document.getElementById('f-q').value.trim();
  const options = [0,1,2,3].map(i => document.getElementById(`f-opt-${i}`).value.trim());
  const correctAnswer = parseInt(document.getElementById('f-correct').value);
  if (!question || options.some(o => !o)) return toast('Semua kolom wajib diisi', 'error');
  const qs = Storage.get('questions');
  if (id) {
    const i = qs.findIndex(q => q.id === id);
    if (i > -1) qs[i] = { ...qs[i], question, options, correctAnswer };
  } else {
    qs.push({ id: 'q' + uid(), examId, question, options, correctAnswer });
  }
  Storage.set('questions', qs);
  closeModal();
  toast(id ? 'Soal diperbarui' : 'Soal ditambahkan');
  renderContent();
};

window.editQuestion = function(id) {
  const q = Storage.get('questions').find(q => q.id === id);
  if (q) showQuestionModal(q);
};

window.deleteQuestion = function(id) {
  if (!confirm('Hapus soal ini?')) return;
  Storage.set('questions', Storage.get('questions').filter(q => q.id !== id));
  toast('Soal dihapus');
  renderContent();
};

// ───────────────────────────────────────────────────────
// NILAI (GURU)
// ───────────────────────────────────────────────────────
function renderNilai(el) {
  const scores = Storage.get('scores');
  const exams = Storage.get('exams');
  const getExamTitle = id => exams.find(e => e.id === id)?.title || 'Unknown';
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><h3>Rekap Nilai Ujian</h3></div>
      <table class="data-table">
        <thead><tr><th>Nama Siswa</th><th>Ujian</th><th>Nilai</th><th>Tanggal</th><th>Keterangan</th></tr></thead>
        <tbody>
          ${scores.map(sc => `
            <tr>
              <td>${sc.studentName}</td>
              <td>${getExamTitle(sc.examId)}</td>
              <td><span class="score-pill ${sc.score >= 75 ? 'pass' : 'fail'}">${sc.score}</span></td>
              <td>${formatDate(sc.date)}</td>
              <td><span class="badge ${sc.score >= 75 ? 'badge-active' : 'badge-draft'}">${sc.score >= 75 ? 'Lulus' : 'Tidak Lulus'}</span></td>
            </tr>
          `).join('')}
          ${!scores.length ? '<tr><td colspan="5" class="empty-row">Belum ada nilai</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

// ───────────────────────────────────────────────────────
// ABSENSI (GURU)
// ───────────────────────────────────────────────────────
function renderAbsensi(el) {
  const students = Storage.get('students');
  const today = new Date().toISOString().split('T')[0];
  const att = Storage.getObj('attendance_today', {});

  el.innerHTML = `
    <div class="page-actions">
      <span class="date-badge">📅 ${formatDate(today)}</span>
      <button class="btn btn-primary" onclick="saveAbsensi()">💾 Simpan Absensi</button>
    </div>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Status</th></tr></thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td>${s.nis}</td>
              <td>${s.name}</td>
              <td>${s.kelas}</td>
              <td>
                <div class="att-toggle">
                  ${['Hadir','Sakit','Izin','Alfa'].map(st => `
                    <label class="att-label">
                      <input type="radio" name="att-${s.id}" value="${st}" ${(att[s.id] || 'Hadir') === st ? 'checked' : ''}>
                      <span class="att-btn ${st.toLowerCase()}">${st}</span>
                    </label>
                  `).join('')}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.saveAbsensi = function() {
  const students = Storage.get('students');
  const att = {};
  students.forEach(s => {
    const el = document.querySelector(`input[name="att-${s.id}"]:checked`);
    if (el) att[s.id] = el.value;
  });
  Storage.setObj('attendance_today', att);
  toast('Absensi disimpan');
};

// ───────────────────────────────────────────────────────
// SISWA (GURU)
// ───────────────────────────────────────────────────────
function renderSiswa(el) {
  const students = Storage.get('students');
  el.innerHTML = `
    <div class="page-actions">
      <button class="btn btn-primary" onclick="showStudentModal()">＋ Tambah Siswa</button>
    </div>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr></thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td>${s.nis}</td>
              <td>${s.name}</td>
              <td>${s.kelas}</td>
              <td class="action-cell">
                <button class="btn-icon" onclick="editStudent('${s.id}')">✏️</button>
                <button class="btn-icon btn-del" onclick="deleteStudent('${s.id}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.showStudentModal = function(s = null) {
  showModal(`
    <h2>${s ? 'Edit Siswa' : 'Tambah Siswa'}</h2>
    <div class="form-group"><label>NIS</label><input id="f-nis" class="form-input" value="${s?.nis || ''}"></div>
    <div class="form-group"><label>Nama</label><input id="f-name" class="form-input" value="${s?.name || ''}"></div>
    <div class="form-group"><label>Kelas</label><input id="f-kelas" class="form-input" value="${s?.kelas || ''}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveStudent('${s?.id || ''}')">Simpan</button>
    </div>
  `);
};

window.saveStudent = function(id) {
  const nis = document.getElementById('f-nis').value.trim();
  const name = document.getElementById('f-name').value.trim();
  const kelas = document.getElementById('f-kelas').value.trim();
  if (!nis || !name || !kelas) return toast('Semua kolom wajib diisi', 'error');
  const students = Storage.get('students');
  if (id) {
    const i = students.findIndex(s => s.id === id);
    if (i > -1) students[i] = { ...students[i], nis, name, kelas };
  } else {
    students.push({ id: 's' + uid(), nis, name, kelas });
  }
  Storage.set('students', students);
  closeModal();
  toast('Data siswa disimpan');
  navigate('siswa');
};

window.editStudent = function(id) {
  const s = Storage.get('students').find(s => s.id === id);
  if (s) showStudentModal(s);
};

window.deleteStudent = function(id) {
  if (!confirm('Hapus siswa ini?')) return;
  Storage.set('students', Storage.get('students').filter(s => s.id !== id));
  toast('Siswa dihapus');
  navigate('siswa');
};

// ───────────────────────────────────────────────────────
// MURID DASHBOARD
// ───────────────────────────────────────────────────────
function renderMuridDashboard(el) {
  const exams = Storage.get('exams').filter(e => e.status === 'active');
  const scores = Storage.get('scores');
  const done = scores.length;
  const avg = done ? Math.round(scores.reduce((s, sc) => s + sc.score, 0) / done) : 0;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-body"><div class="stat-num">${exams.length}</div><div class="stat-label">Ujian Tersedia</div></div>
      </div>
      <div class="stat-card accent-2">
        <div class="stat-icon">✅</div>
        <div class="stat-body"><div class="stat-num">${done}</div><div class="stat-label">Ujian Selesai</div></div>
      </div>
      <div class="stat-card accent-3">
        <div class="stat-icon">🏆</div>
        <div class="stat-body"><div class="stat-num">${avg}</div><div class="stat-label">Rata-rata Nilai</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Ujian Aktif</h3></div>
      <div class="exam-cards">
        ${exams.map(e => `
          <div class="exam-card">
            <div class="exam-card-header">${e.subject || 'Ujian'}</div>
            <h4>${e.title}</h4>
            <div class="exam-meta">📅 ${formatDate(e.date)} · ⏱ ${e.duration} menit</div>
            <button class="btn btn-primary" onclick="startQuiz('${e.id}')">Kerjakan →</button>
          </div>
        `).join('')}
        ${!exams.length ? '<div class="empty-state">Tidak ada ujian aktif</div>' : ''}
      </div>
    </div>
  `;
}

// ───────────────────────────────────────────────────────
// DAFTAR UJIAN (MURID)
// ───────────────────────────────────────────────────────
function renderDaftarUjian(el) {
  const exams = Storage.get('exams').filter(e => e.status === 'active');
  const scores = Storage.get('scores');

  el.innerHTML = `
    <div class="exam-cards">
      ${exams.map(e => {
        const done = scores.find(sc => sc.examId === e.id);
        const qCount = Storage.get('questions').filter(q => q.examId === e.id).length;
        return `
          <div class="exam-card">
            <div class="exam-card-header">${e.subject || 'Ujian'}</div>
            <h4>${e.title}</h4>
            <div class="exam-meta">📅 ${formatDate(e.date)} · ⏱ ${e.duration} menit · 📝 ${qCount} soal</div>
            ${done
              ? `<div class="done-badge">✓ Selesai — Nilai: <strong>${done.score}</strong></div>`
              : `<button class="btn btn-primary" onclick="startQuiz('${e.id}')">Mulai Ujian →</button>`
            }
          </div>
        `;
      }).join('')}
      ${!exams.length ? '<div class="empty-state">Tidak ada ujian aktif</div>' : ''}
    </div>
  `;
}

// ───────────────────────────────────────────────────────
// NILAI SAYA (MURID)
// ───────────────────────────────────────────────────────
function renderNilaiSaya(el) {
  const scores = Storage.get('scores');
  const exams = Storage.get('exams');
  const getTitle = id => exams.find(e => e.id === id)?.title || 'Ujian';

  el.innerHTML = `
    <div class="card">
      <div class="card-header"><h3>Riwayat Nilai Saya</h3></div>
      ${scores.length ? `
        <table class="data-table">
          <thead><tr><th>Ujian</th><th>Nilai</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>
            ${scores.map(sc => `
              <tr>
                <td>${getTitle(sc.examId)}</td>
                <td>
                  <div class="score-bar-wrap">
                    <div class="score-bar" style="width:${sc.score}%"></div>
                    <span>${sc.score}</span>
                  </div>
                </td>
                <td>${formatDate(sc.date)}</td>
                <td><span class="badge ${sc.score >= 75 ? 'badge-active' : 'badge-draft'}">${sc.score >= 75 ? 'Lulus' : 'Tidak Lulus'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="empty-state">Belum ada nilai</div>'}
    </div>
  `;
}

// ───────────────────────────────────────────────────────
// QUIZ ENGINE
// ───────────────────────────────────────────────────────
window.startQuiz = function(examId) {
  const questions = Storage.get('questions').filter(q => q.examId === examId);
  if (!questions.length) return toast('Ujian ini belum memiliki soal', 'error');
  const exam = Storage.get('exams').find(e => e.id === examId);
  appState.quizState = {
    examId, exam,
    questions,
    current: 0,
    answers: new Array(questions.length).fill(null),
    timeLeft: (exam?.duration || 30) * 60,
    timerInterval: null,
  };
  navigate('kerjakan-ujian');
};

function renderKerjakanUjian(el) {
  const qs = appState.quizState;
  if (!qs) return el.innerHTML = '<div class="empty-state">Tidak ada ujian aktif</div>';

  const q = qs.questions[qs.current];
  const total = qs.questions.length;
  const answered = qs.answers.filter(a => a !== null).length;
  const pct = Math.round(((qs.current) / total) * 100);

  el.innerHTML = `
    <div class="quiz-wrap">
      <div class="quiz-header">
        <div class="quiz-meta">
          <span class="quiz-title">${qs.exam.title}</span>
          <span class="quiz-prog">${qs.current + 1} / ${total}</span>
        </div>
        <div class="quiz-timer" id="quiz-timer">⏱ ${formatTime(qs.timeLeft)}</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-body">
        <div class="q-num-badge">Soal ${qs.current + 1}</div>
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-opt ${qs.answers[qs.current] === i ? 'selected' : ''}"
              onclick="selectAnswer(${i})">
              <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="quiz-nav">
        <button class="btn btn-ghost" onclick="quizPrev()" ${qs.current === 0 ? 'disabled' : ''}>← Sebelumnya</button>
        <div class="quiz-dots">
          ${qs.questions.map((_, i) => `
            <span class="quiz-dot ${i === qs.current ? 'cur' : ''} ${qs.answers[i] !== null ? 'done' : ''}" onclick="jumpQuiz(${i})"></span>
          `).join('')}
        </div>
        ${qs.current < total - 1
          ? `<button class="btn btn-primary" onclick="quizNext()">Selanjutnya →</button>`
          : `<button class="btn btn-success" onclick="submitQuiz()">Submit Ujian ✓</button>`
        }
      </div>
      <div class="quiz-status">${answered}/${total} soal dijawab</div>
    </div>
  `;

  // Timer
  if (qs.timerInterval) clearInterval(qs.timerInterval);
  qs.timerInterval = setInterval(() => {
    qs.timeLeft--;
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) timerEl.textContent = '⏱ ' + formatTime(qs.timeLeft);
    if (qs.timeLeft <= 0) { clearInterval(qs.timerInterval); submitQuiz(); }
    if (qs.timeLeft <= 60 && timerEl) timerEl.classList.add('urgent');
  }, 1000);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

window.selectAnswer = function(i) {
  appState.quizState.answers[appState.quizState.current] = i;
  renderContent();
};

window.quizNext = function() {
  if (appState.quizState.current < appState.quizState.questions.length - 1) {
    appState.quizState.current++;
    renderContent();
  }
};

window.quizPrev = function() {
  if (appState.quizState.current > 0) {
    appState.quizState.current--;
    renderContent();
  }
};

window.jumpQuiz = function(i) {
  appState.quizState.current = i;
  renderContent();
};

window.submitQuiz = function() {
  const qs = appState.quizState;
  if (qs.timerInterval) clearInterval(qs.timerInterval);

  const unanswered = qs.answers.filter(a => a === null).length;
  if (unanswered > 0 && !confirm(`Masih ada ${unanswered} soal belum dijawab. Tetap submit?`)) return;

  let correct = 0;
  qs.questions.forEach((q, i) => {
    if (qs.answers[i] === q.correctAnswer) correct++;
  });
  const score = Math.round((correct / qs.questions.length) * 100);

  const scores = Storage.get('scores');
  const studentName = prompt('Masukkan nama kamu:') || 'Murid';
  scores.push({
    id: 'sc' + uid(),
    examId: qs.examId,
    studentName,
    score,
    date: new Date().toISOString().split('T')[0],
    answers: qs.answers,
    correct,
    total: qs.questions.length,
  });
  Storage.set('scores', scores);
  appState.quizState = null;

  // Result screen
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="result-wrap">
      <div class="result-card">
        <div class="result-icon">${score >= 75 ? '🎉' : '📚'}</div>
        <h2>${score >= 75 ? 'Selamat!' : 'Tetap Semangat!'}</h2>
        <div class="result-score">${score}</div>
        <div class="result-label">Nilai Kamu</div>
        <div class="result-detail">${correct} dari ${qs.questions.length} soal benar</div>
        <div class="result-status ${score >= 75 ? 'pass' : 'fail'}">${score >= 75 ? '✓ Lulus' : '✗ Belum Lulus'}</div>
        <button class="btn btn-primary" onclick="navigate('nilai-saya')">Lihat Semua Nilai</button>
      </div>
    </div>
  `;
  document.getElementById('page-title').textContent = 'Hasil Ujian';
};

// ───────────────────────────────────────────────────────
// MODAL
// ───────────────────────────────────────────────────────
function showModal(html) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-body').innerHTML = html;
  overlay.classList.add('active');
}

window.closeModal = function() {
  document.getElementById('modal-overlay').classList.remove('active');
};

// ───────────────────────────────────────────────────────
// INIT
// ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Storage.seed();

  document.getElementById('btn-guru').addEventListener('click', () => setRole('guru'));
  document.getElementById('btn-murid').addEventListener('click', () => setRole('murid'));
  document.getElementById('btn-switch-role').addEventListener('click', () => {
    appState.role = null;
    appState.page = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('landing').style.display = 'flex';
  });

  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});
