/* ============================================
   GRADES.JS — Grades Page (Teacher)
   ============================================ */

const GradesPage = {
    render() {
        const container = document.getElementById('page-grades');
        const exams = AppData.exams;

        container.innerHTML = `
      <div class="page-toolbar">
        <div class="toolbar-left">
          <select class="form-control" id="grade-exam-filter" style="width:260px;">
            <option value="">Semua Ujian</option>
            ${exams.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}
          </select>
          <div class="search-bar">
            <span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input type="text" placeholder="Cari siswa..." id="grade-search">
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-secondary" id="export-grades-btn">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body no-padding">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>NIS</th>
                  <th>Kelas</th>
                  <th>Ujian</th>
                  <th>Nilai</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="grades-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderTable();
        this.bindEvents();
    },

    renderTable(examFilter = '', search = '') {
        let scores = AppData.scores;
        if (examFilter) scores = scores.filter(s => s.examId === parseInt(examFilter));

        let rows = scores.map(s => {
            const student = Utils.getStudent(s.studentId);
            const exam = Utils.getExam(s.examId);
            return { ...s, student, exam };
        }).filter(r => r.student && r.exam);

        if (search) {
            rows = rows.filter(r => r.student.name.toLowerCase().includes(search.toLowerCase()));
        }

        const tbody = document.getElementById('grades-tbody');
        if (!tbody) return;

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>Tidak ada data nilai</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="cell-bold">${r.student.name}</td>
        <td>${r.student.nis}</td>
        <td>${r.student.class}</td>
        <td>${r.exam.title}</td>
        <td>
          <span class="badge badge-${r.score >= 80 ? 'green' : r.score >= 60 ? 'yellow' : 'red'}">${r.score}</span>
        </td>
        <td>
          <button class="btn-icon" title="Edit Nilai" onclick="GradesPage.editScore(${r.id})">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
    },

    bindEvents() {
        document.getElementById('grade-exam-filter')?.addEventListener('change', (e) => {
            const search = document.getElementById('grade-search')?.value || '';
            this.renderTable(e.target.value, search);
        });

        document.getElementById('grade-search')?.addEventListener('input', Utils.debounce((e) => {
            const examFilter = document.getElementById('grade-exam-filter')?.value || '';
            this.renderTable(examFilter, e.target.value);
        }));

        document.getElementById('export-grades-btn')?.addEventListener('click', () => {
            const rows = AppData.scores.map(s => {
                const student = Utils.getStudent(s.studentId);
                const exam = Utils.getExam(s.examId);
                return [student?.name || '', student?.nis || '', student?.class || '', exam?.title || '', s.score];
            });
            Utils.exportCSV('nilai_siswa.csv', ['Nama', 'NIS', 'Kelas', 'Ujian', 'Nilai'], rows);
        });
    },

    editScore(scoreId) {
        const score = AppData.scores.find(s => s.id === scoreId);
        if (!score) return;
        const student = Utils.getStudent(score.studentId);

        Utils.openModal('Edit Nilai', `
      <div class="form-group">
        <label>Siswa</label>
        <input type="text" class="form-control" value="${student?.name || ''}" disabled>
      </div>
      <div class="form-group">
        <label for="edit-score-val">Nilai</label>
        <input type="number" class="form-control" id="edit-score-val" min="0" max="100" value="${score.score}">
      </div>
    `, `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="GradesPage.saveScore(${scoreId})">Simpan</button>
    `);
    },

    saveScore(scoreId) {
        const val = parseInt(document.getElementById('edit-score-val').value);
        if (isNaN(val) || val < 0 || val > 100) {
            Utils.showToast('Nilai harus antara 0-100', 'error');
            return;
        }
        const score = AppData.scores.find(s => s.id === scoreId);
        if (score) score.score = val;
        Utils.closeModal();
        Utils.showToast('Nilai berhasil diperbarui', 'success');
        this.renderTable();
    }
};
