/* ============================================
   EXAMS.JS — Exam Management (Teacher)
   ============================================ */

const ExamsPage = {
    currentFilter: 'all',

    render() {
        const container = document.getElementById('page-exams');
        container.innerHTML = `
      <div class="page-toolbar">
        <div class="toolbar-left">
          <div class="filter-tabs">
            <button class="filter-tab active" data-filter="all">Semua</button>
            <button class="filter-tab" data-filter="draft">Draft</button>
            <button class="filter-tab" data-filter="published">Published</button>
            <button class="filter-tab" data-filter="active">Active</button>
            <button class="filter-tab" data-filter="finished">Finished</button>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="search-bar">
            <span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input type="text" placeholder="Cari ujian..." id="exam-search">
          </div>
          <button class="btn btn-primary" id="add-exam-btn">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Buat Ujian
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body no-padding">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nama Ujian</th>
                  <th>Mata Pelajaran</th>
                  <th>Kelas</th>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="exams-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderTable();
        this.bindEvents();
    },

    renderTable(filter = 'all', search = '') {
        let exams = AppData.exams;
        if (filter !== 'all') exams = exams.filter(e => e.status === filter);
        if (search) exams = exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.subject.toLowerCase().includes(search.toLowerCase()));

        const tbody = document.getElementById('exams-tbody');
        if (!tbody) return;

        if (exams.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>Tidak ada ujian ditemukan</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = exams.map(e => `
      <tr>
        <td class="cell-bold">${e.title}</td>
        <td>${e.subject}</td>
        <td>${e.class}</td>
        <td>${Utils.formatShortDate(e.date)}</td>
        <td>${e.duration} menit</td>
        <td>${Utils.statusBadge(e.status)}</td>
        <td>
          <div class="cell-actions">
            <button class="btn-icon" title="Edit" onclick="ExamsPage.editExam(${e.id})">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            ${e.status === 'draft' ? `
            <button class="btn-icon" title="Publish" onclick="ExamsPage.publishExam(${e.id})">
              <svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>` : ''}
            <button class="btn-icon" title="Hapus" onclick="ExamsPage.deleteExam(${e.id})">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    },

    bindEvents() {
        // Filter tabs
        document.querySelectorAll('#page-exams .filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#page-exams .filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                const search = document.getElementById('exam-search')?.value || '';
                this.renderTable(this.currentFilter, search);
            });
        });

        // Search
        const searchInput = document.getElementById('exam-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.renderTable(this.currentFilter, e.target.value);
            }));
        }

        // Add exam
        document.getElementById('add-exam-btn')?.addEventListener('click', () => this.showExamForm());
    },

    showExamForm(exam = null) {
        const isEdit = !!exam;
        const classes = AppData.getClasses();

        const body = `
      <div class="form-group">
        <label for="exam-title">Nama Ujian</label>
        <input type="text" class="form-control" id="exam-title" placeholder="Contoh: UTS Matematika" value="${exam ? exam.title : ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="exam-subject">Mata Pelajaran</label>
          <input type="text" class="form-control" id="exam-subject" placeholder="Contoh: Matematika" value="${exam ? exam.subject : ''}">
        </div>
        <div class="form-group">
          <label for="exam-class">Kelas</label>
          <select class="form-control" id="exam-class">
            ${classes.map(c => `<option value="${c}" ${exam && exam.class === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="exam-date">Tanggal</label>
          <input type="date" class="form-control" id="exam-date" value="${exam ? exam.date : ''}">
        </div>
        <div class="form-group">
          <label for="exam-duration">Durasi (menit)</label>
          <input type="number" class="form-control" id="exam-duration" placeholder="90" value="${exam ? exam.duration : ''}">
        </div>
      </div>
    `;

        const footer = `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="ExamsPage.saveExam(${exam ? exam.id : 'null'})">${isEdit ? 'Simpan' : 'Buat Ujian'}</button>
    `;

        Utils.openModal(isEdit ? 'Edit Ujian' : 'Buat Ujian Baru', body, footer);
    },

    saveExam(id) {
        const title = document.getElementById('exam-title').value.trim();
        const subject = document.getElementById('exam-subject').value.trim();
        const cls = document.getElementById('exam-class').value;
        const date = document.getElementById('exam-date').value;
        const duration = parseInt(document.getElementById('exam-duration').value) || 60;

        if (!title || !subject || !date) {
            Utils.showToast('Harap isi semua field yang wajib', 'error');
            return;
        }

        if (id) {
            // Edit
            const exam = AppData.exams.find(e => e.id === id);
            if (exam) {
                exam.title = title;
                exam.subject = subject;
                exam.class = cls;
                exam.date = date;
                exam.duration = duration;
            }
            Utils.showToast('Ujian berhasil diperbarui', 'success');
        } else {
            // Create
            AppData.exams.push({
                id: AppData.nextExamId++,
                title, subject, date, duration,
                status: 'draft',
                class: cls,
                teacherId: AppData.currentUser.id,
            });
            Utils.showToast('Ujian baru berhasil dibuat', 'success');
        }

        Utils.closeModal();
        this.renderTable(this.currentFilter);
    },

    editExam(id) {
        const exam = AppData.exams.find(e => e.id === id);
        if (exam) this.showExamForm(exam);
    },

    publishExam(id) {
        const exam = AppData.exams.find(e => e.id === id);
        if (exam) {
            exam.status = 'published';
            Utils.showToast(`Ujian "${exam.title}" berhasil dipublish`, 'success');
            this.renderTable(this.currentFilter);
        }
    },

    deleteExam(id) {
        const exam = AppData.exams.find(e => e.id === id);
        if (!exam) return;

        Utils.openModal('Hapus Ujian', `<p>Apakah Anda yakin ingin menghapus ujian <strong>"${exam.title}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>`,
            `<button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
       <button class="btn btn-danger" onclick="ExamsPage.confirmDelete(${id})">Hapus</button>`
        );
    },

    confirmDelete(id) {
        AppData.exams = AppData.exams.filter(e => e.id !== id);
        Utils.closeModal();
        Utils.showToast('Ujian berhasil dihapus', 'success');
        this.renderTable(this.currentFilter);
    }
};
