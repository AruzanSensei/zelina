let currentRole = 'guru'; // 'guru' | 'murid'
let currentPage = 'overview';

function setRole(role) {
  currentRole = role;
  document.getElementById('role-guru').classList.toggle('active', role === 'guru');
  document.getElementById('role-murid').classList.toggle('active', role === 'murid');
  renderSidebar();
  navigate(role === 'guru' ? 'overview' : 'student-dashboard');
}

function renderSidebar() {
  const guruNav = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'exams', icon: '📋', label: 'Ujian' },
    { id: 'questions', icon: '❓', label: 'Soal' },
    { id: 'scores', icon: '🏆', label: 'Nilai' },
    { id: 'students', icon: '👥', label: 'Data Siswa' },
  ];
  const muridNav = [
    { id: 'student-dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'student-exams', icon: '📋', label: 'Daftar Ujian' },
    { id: 'student-scores', icon: '🏆', label: 'Nilai Saya' },
  ];
  const nav = currentRole === 'guru' ? guruNav : muridNav;
  document.getElementById('sidebar-nav').innerHTML = nav.map(item => `
    <button class="nav-item ${currentPage === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');
}

function navigate(page) {
  currentPage = page;
  if (Quiz.state.timerInterval && page !== 'quiz') {
    // don't clear timer if mid-quiz
  }
  renderSidebar();
  const content = document.getElementById('main-content');
  const titles = {
    overview: 'Overview', exams: 'Ujian', questions: 'Bank Soal', scores: 'Nilai',
    students: 'Data Siswa', 'student-dashboard': 'Dashboard Murid',
    'student-exams': 'Daftar Ujian', 'student-scores': 'Nilai Saya'
  };
  document.getElementById('page-title').textContent = titles[page] || '';

  switch (page) {
    case 'overview': renderOverview(content); break;
    case 'exams': Exams.renderList(content); break;
    case 'questions': Questions.renderList(content); break;
    case 'scores': renderScores(content); break;
    case 'students': renderStudents(content); break;
    case 'student-dashboard': renderStudentDashboard(content); break;
    case 'student-exams': renderStudentExams(content); break;
    case 'student-scores': renderStudentScores(content); break;
  }
}

function renderOverview(container) {
  const exams = Exams.getAll();
  const students = Storage.get('students');
  const scores = Storage.get('scores');
  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
  const activeExams = exams.filter(e => e.status === 'active').length;

  container.innerHTML = `
    <div class="page-header">
      <div><h2>Overview</h2><p class="subtitle">Ringkasan sistem ujian</p></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card" style="--accent:#6366f1">
        <div class="stat-icon">👥</div>
        <div class="stat-body">
          <div class="stat-num">${students.length}</div>
          <div class="stat-label">Total Siswa</div>
        </div>
      </div>
      <div class="stat-card" style="--accent:#0ea5e9">
        <div class="stat-icon">📋</div>
        <div class="stat-body">
          <div class="stat-num">${exams.length}</div>
          <div class="stat-label">Total Ujian</div>
        </div>
      </div>
      <div class="stat-card" style="--accent:#10b981">
        <div class="stat-icon">✅</div>
        <div class="stat-body">
          <div class="stat-num">${activeExams}</div>
          <div class="stat-label">Ujian Aktif</div>
        </div>
      </div>
      <div class="stat-card" style="--accent:#f59e0b">
        <div class="stat-icon">🏆</div>
        <div class="stat-body">
          <div class="stat-num">${avgScore}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>
    </div>
    <div class="overview-bottom">
      <div class="card-table">
        <div class="table-title">Ujian Terbaru</div>
        <table>
          <thead><tr><th>Judul</th><th>Kelas</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>
            ${exams.slice(-5).reverse().map(e => `
              <tr>
                <td><strong>${e.title}</strong></td>
                <td><span class="badge-class">${e.class || '-'}</span></td>
                <td>${e.date}</td>
                <td><span class="status-badge status-${e.status}">${e.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="card-table">
        <div class="table-title">Nilai Terbaru</div>
        <table>
          <thead><tr><th>Siswa</th><th>Ujian</th><th>Nilai</th></tr></thead>
          <tbody>
            ${scores.length ? scores.slice(-5).reverse().map(s => `
              <tr>
                <td>${s.studentName}</td>
                <td>${s.examTitle}</td>
                <td><span class="score-chip ${s.score>=70?'pass':'fail'}">${s.score}</span></td>
              </tr>
            `).join('') : '<tr><td colspan="3" class="empty-row">Belum ada nilai</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderScores(container) {
  const scores = Storage.get('scores');
  container.innerHTML = `
    <div class="page-header">
      <div><h2>Rekap Nilai</h2><p class="subtitle">${scores.length} data nilai tersimpan</p></div>
      ${scores.length ? `<button class="btn-ghost" onclick="if(confirm('Hapus semua data nilai?')){Storage.set('scores',[]);navigate('scores')}">Hapus Semua</button>` : ''}
    </div>
    <div class="card-table">
      <table>
        <thead><tr><th>Siswa</th><th>Ujian</th><th>Benar</th><th>Total</th><th>Nilai</th><th>Grade</th><th>Waktu</th></tr></thead>
        <tbody>
          ${scores.length ? scores.slice().reverse().map(s => {
            const grade = s.score>=90?'A':s.score>=80?'B':s.score>=70?'C':s.score>=60?'D':'E';
            return `<tr>
              <td>${s.studentName}</td>
              <td>${s.examTitle}</td>
              <td>${s.correct}</td>
              <td>${s.totalQuestions}</td>
              <td><span class="score-chip ${s.score>=70?'pass':'fail'}">${s.score}</span></td>
              <td><strong>${grade}</strong></td>
              <td class="text-muted">${new Date(s.submittedAt).toLocaleString('id-ID')}</td>
            </tr>`;
          }).join('') : '<tr><td colspan="7" class="empty-row">Belum ada data nilai</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderStudents(container) {
  const students = Storage.get('students');
  container.innerHTML = `
    <div class="page-header">
      <div><h2>Data Siswa</h2><p class="subtitle">${students.length} siswa terdaftar</p></div>
      <button class="btn-primary" onclick="showAddStudentForm()">+ Tambah Siswa</button>
    </div>
    <div class="card-table">
      <table>
        <thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr></thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td>${s.nis}</td>
              <td><strong>${s.name}</strong></td>
              <td><span class="badge-class">${s.class}</span></td>
              <td><button class="btn-icon danger" onclick="deleteStudent('${s.id}')">🗑️</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAddStudentForm() {
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header"><h3>Tambah Siswa</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="form-row"><label>NIS</label><input id="f-nis" type="text" placeholder="2024009"></div>
        <div class="form-row"><label>Nama Lengkap</label><input id="f-name" type="text" placeholder="Nama siswa"></div>
        <div class="form-row"><label>Kelas</label>
          <select id="f-sclass">${['X-A','X-B','XI-A','XI-B','XII-A','XII-B'].map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeModal()">Batal</button>
        <button class="btn-primary" onclick="saveStudent()">Simpan</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function saveStudent() {
  const nis = document.getElementById('f-nis').value.trim();
  const name = document.getElementById('f-name').value.trim();
  const cls = document.getElementById('f-sclass').value;
  if (!nis || !name) { alert('NIS dan Nama wajib diisi'); return; }
  const students = Storage.get('students');
  students.push({ id: 's' + Date.now(), nis, name, class: cls });
  Storage.set('students', students);
  closeModal();
  navigate('students');
}

function deleteStudent(id) {
  if (!confirm('Hapus siswa ini?')) return;
  Storage.set('students', Storage.get('students').filter(s => s.id !== id));
  navigate('students');
}

function renderStudentDashboard(container) {
  const name = document.getElementById('student-name-display')?.textContent || 'Murid';
  const scores = Storage.get('scores').filter(s => s.studentName === name);
  const exams = Exams.getAll().filter(e => e.status === 'active');
  container.innerHTML = `
    <div class="page-header"><div><h2>Selamat Datang, ${name}!</h2><p class="subtitle">Semangat belajar hari ini 💪</p></div></div>
    <div class="stats-grid">
      <div class="stat-card" style="--accent:#6366f1">
        <div class="stat-icon">📋</div>
        <div class="stat-body"><div class="stat-num">${exams.length}</div><div class="stat-label">Ujian Tersedia</div></div>
      </div>
      <div class="stat-card" style="--accent:#10b981">
        <div class="stat-icon">✅</div>
        <div class="stat-body"><div class="stat-num">${scores.length}</div><div class="stat-label">Ujian Dikerjakan</div></div>
      </div>
      <div class="stat-card" style="--accent:#f59e0b">
        <div class="stat-icon">🏆</div>
        <div class="stat-body">
          <div class="stat-num">${scores.length ? Math.round(scores.reduce((a,s)=>a+s.score,0)/scores.length) : '-'}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>
    </div>
    <div class="card-table">
      <div class="table-title">Ujian Aktif</div>
      <table>
        <thead><tr><th>Judul</th><th>Mata Pelajaran</th><th>Durasi</th><th>Aksi</th></tr></thead>
        <tbody>
          ${exams.length ? exams.map(e => `
            <tr>
              <td><strong>${e.title}</strong></td>
              <td>${e.subject}</td>
              <td>${e.duration} menit</td>
              <td><button class="btn-primary btn-sm" onclick="Quiz.start('${e.id}');currentPage='quiz';renderSidebar()">Kerjakan →</button></td>
            </tr>
          `).join('') : '<tr><td colspan="4" class="empty-row">Tidak ada ujian aktif</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderStudentExams(container) {
  const exams = Exams.getAll().filter(e => e.status === 'active');
  container.innerHTML = `
    <div class="page-header"><div><h2>Daftar Ujian</h2><p class="subtitle">Ujian yang tersedia untuk kamu</p></div></div>
    <div class="exams-grid">
      ${exams.length ? exams.map(e => {
        const qCount = Questions.getByExam(e.id).length;
        return `
          <div class="exam-card">
            <div class="exam-card-header">
              <span class="exam-subject">${e.subject}</span>
              <span class="badge-class">${e.class}</span>
            </div>
            <h3>${e.title}</h3>
            <div class="exam-card-meta">
              <span>📅 ${e.date}</span>
              <span>⏱ ${e.duration} menit</span>
              <span>❓ ${qCount} soal</span>
            </div>
            <button class="btn-primary w-full mt-3" onclick="Quiz.start('${e.id}');currentPage='quiz';renderSidebar()" 
              ${qCount === 0 ? 'disabled' : ''}>
              ${qCount === 0 ? 'Belum Ada Soal' : 'Mulai Ujian →'}
            </button>
          </div>
        `;
      }).join('') : '<div class="empty-state"><p>Belum ada ujian aktif.</p></div>'}
    </div>
  `;
}

function renderStudentScores(container) {
  const name = document.getElementById('student-name-display')?.textContent || 'Murid';
  const scores = Storage.get('scores').filter(s => s.studentName === name);
  container.innerHTML = `
    <div class="page-header"><div><h2>Nilai Saya</h2><p class="subtitle">Riwayat hasil ujian kamu</p></div></div>
    <div class="card-table">
      <table>
        <thead><tr><th>Ujian</th><th>Benar</th><th>Total</th><th>Nilai</th><th>Grade</th><th>Tanggal</th></tr></thead>
        <tbody>
          ${scores.length ? scores.slice().reverse().map(s => {
            const grade = s.score>=90?'A':s.score>=80?'B':s.score>=70?'C':s.score>=60?'D':'E';
            return `<tr>
              <td><strong>${s.examTitle}</strong></td>
              <td>${s.correct}</td>
              <td>${s.totalQuestions}</td>
              <td><span class="score-chip ${s.score>=70?'pass':'fail'}">${s.score}</span></td>
              <td><strong>${grade}</strong></td>
              <td class="text-muted">${new Date(s.submittedAt).toLocaleString('id-ID')}</td>
            </tr>`;
          }).join('') : '<tr><td colspan="6" class="empty-row">Belum mengerjakan ujian</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  Storage.seed();
  // Show name modal first
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header"><h3>Selamat Datang di SiUjian</h3></div>
      <div class="modal-body">
        <div class="form-row">
          <label>Masukkan Nama Kamu</label>
          <input id="f-student-name" type="text" placeholder="Nama lengkap..." value="Murid Demo">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary w-full" onclick="
          const n = document.getElementById('f-student-name').value.trim() || 'Murid Demo';
          document.getElementById('student-name-display').textContent = n;
          closeModal();
          navigate('overview');
        ">Masuk →</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
  renderSidebar();
});
