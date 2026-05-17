/* ============================================
   ATTENDANCE.JS — Attendance Page (Teacher)
   ============================================ */

const AttendancePage = {
    render() {
        const exams = AppData.exams.filter(e => e.status === 'finished' || e.status === 'active');

        const container = document.getElementById('page-attendance');
        container.innerHTML = `
      <div class="page-toolbar">
        <div class="toolbar-left">
          <select class="form-control" id="att-exam-filter" style="width:260px;">
            <option value="">Semua Ujian</option>
            ${exams.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-secondary" id="export-att-btn">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="stats-grid" style="margin-bottom:var(--space-5);">
        <div class="stat-card green">
          <div class="stat-value" id="att-hadir">0</div>
          <div class="stat-label">Hadir</div>
        </div>
        <div class="stat-card red">
          <div class="stat-value" id="att-tidak">0</div>
          <div class="stat-label">Tidak Hadir</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-value" id="att-izin">0</div>
          <div class="stat-label">Izin</div>
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
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="att-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderTable();
        this.bindEvents();
    },

    renderTable(examFilter = '') {
        let records = AppData.attendance;
        if (examFilter) records = records.filter(r => r.examId === parseInt(examFilter));

        // Stats
        const hadir = records.filter(r => r.status === 'hadir').length;
        const tidak = records.filter(r => r.status === 'tidak hadir').length;
        const izin = records.filter(r => r.status === 'izin').length;

        const hadirEl = document.getElementById('att-hadir');
        const tidakEl = document.getElementById('att-tidak');
        const izinEl = document.getElementById('att-izin');
        if (hadirEl) hadirEl.textContent = hadir;
        if (tidakEl) tidakEl.textContent = tidak;
        if (izinEl) izinEl.textContent = izin;

        const tbody = document.getElementById('att-tbody');
        if (!tbody) return;

        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>Tidak ada data absensi</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = records.map(r => {
            const student = Utils.getStudent(r.studentId);
            const exam = Utils.getExam(r.examId);
            return `
        <tr>
          <td class="cell-bold">${student?.name || '-'}</td>
          <td>${student?.nis || '-'}</td>
          <td>${student?.class || '-'}</td>
          <td>${exam?.title || '-'}</td>
          <td>${Utils.statusBadge(r.status)}</td>
          <td>
            <select class="form-control" style="width:140px;padding:4px 8px;font-size:12px;" onchange="AttendancePage.updateStatus(${r.id}, this.value)">
              <option value="hadir" ${r.status === 'hadir' ? 'selected' : ''}>Hadir</option>
              <option value="tidak hadir" ${r.status === 'tidak hadir' ? 'selected' : ''}>Tidak Hadir</option>
              <option value="izin" ${r.status === 'izin' ? 'selected' : ''}>Izin</option>
            </select>
          </td>
        </tr>
      `;
        }).join('');
    },

    bindEvents() {
        document.getElementById('att-exam-filter')?.addEventListener('change', (e) => {
            this.renderTable(e.target.value);
        });

        document.getElementById('export-att-btn')?.addEventListener('click', () => {
            const rows = AppData.attendance.map(r => {
                const student = Utils.getStudent(r.studentId);
                const exam = Utils.getExam(r.examId);
                return [student?.name || '', student?.nis || '', student?.class || '', exam?.title || '', r.status];
            });
            Utils.exportCSV('absensi.csv', ['Nama', 'NIS', 'Kelas', 'Ujian', 'Status'], rows);
        });
    },

    updateStatus(id, newStatus) {
        const record = AppData.attendance.find(r => r.id === id);
        if (record) {
            record.status = newStatus;
            Utils.showToast('Status absensi diperbarui', 'success');
            const examFilter = document.getElementById('att-exam-filter')?.value || '';
            this.renderTable(examFilter);
        }
    }
};
