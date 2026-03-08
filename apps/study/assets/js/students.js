/* ============================================
   STUDENTS.JS — Student Data Page (Teacher)
   ============================================ */

const StudentsPage = {
    render() {
        const classes = AppData.getClasses();
        const container = document.getElementById('page-students');

        container.innerHTML = `
      <div class="page-toolbar">
        <div class="toolbar-left">
          <select class="form-control" id="student-class-filter" style="width:160px;">
            <option value="">Semua Kelas</option>
            ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <div class="search-bar">
            <span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input type="text" placeholder="Cari siswa..." id="student-search">
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" id="add-student-btn">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Siswa
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body no-padding">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NIS</th>
                  <th>Email</th>
                  <th>Kelas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="students-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderTable();
        this.bindEvents();
    },

    renderTable(classFilter = '', search = '') {
        let students = AppData.getStudents();
        if (classFilter) students = students.filter(s => s.class === classFilter);
        if (search) students = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.nis?.includes(search));

        const tbody = document.getElementById('students-tbody');
        if (!tbody) return;

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>Tidak ada siswa ditemukan</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = students.map(s => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <div class="user-avatar" style="width:32px;height:32px;font-size:11px;">${s.avatar}</div>
            <span class="cell-bold">${s.name}</span>
          </div>
        </td>
        <td>${s.nis || '-'}</td>
        <td class="cell-muted">${s.email}</td>
        <td><span class="badge badge-blue">${s.class}</span></td>
        <td>
          <div class="cell-actions">
            <button class="btn-icon" title="Edit" onclick="StudentsPage.editStudent(${s.id})">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon" title="Hapus" onclick="StudentsPage.deleteStudent(${s.id})">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    },

    bindEvents() {
        document.getElementById('student-class-filter')?.addEventListener('change', (e) => {
            const search = document.getElementById('student-search')?.value || '';
            this.renderTable(e.target.value, search);
        });

        document.getElementById('student-search')?.addEventListener('input', Utils.debounce((e) => {
            const classFilter = document.getElementById('student-class-filter')?.value || '';
            this.renderTable(classFilter, e.target.value);
        }));

        document.getElementById('add-student-btn')?.addEventListener('click', () => this.showStudentForm());
    },

    showStudentForm(student = null) {
        const isEdit = !!student;
        const classes = AppData.getClasses();

        Utils.openModal(isEdit ? 'Edit Siswa' : 'Tambah Siswa Baru', `
      <div class="form-group">
        <label for="st-name">Nama Lengkap</label>
        <input type="text" class="form-control" id="st-name" value="${student ? student.name : ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="st-nis">NIS</label>
          <input type="text" class="form-control" id="st-nis" value="${student ? student.nis || '' : ''}">
        </div>
        <div class="form-group">
          <label for="st-class">Kelas</label>
          <select class="form-control" id="st-class">
            ${classes.map(c => `<option value="${c}" ${student && student.class === c ? 'selected' : ''}>${c}</option>`).join('')}
            <option value="__new">+ Kelas Baru</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="st-email">Email</label>
        <input type="email" class="form-control" id="st-email" value="${student ? student.email : ''}">
      </div>
    `, `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="StudentsPage.saveStudent(${student ? student.id : 'null'})">${isEdit ? 'Simpan' : 'Tambah'}</button>
    `);
    },

    saveStudent(id) {
        const name = document.getElementById('st-name').value.trim();
        const nis = document.getElementById('st-nis').value.trim();
        const email = document.getElementById('st-email').value.trim();
        let cls = document.getElementById('st-class').value;

        if (cls === '__new') {
            cls = prompt('Masukkan nama kelas baru:');
            if (!cls) return;
        }

        if (!name || !email) {
            Utils.showToast('Nama dan email wajib diisi', 'error');
            return;
        }

        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        if (id) {
            const student = AppData.users.find(u => u.id === id);
            if (student) {
                Object.assign(student, { name, nis, email, class: cls, avatar: initials });
            }
            Utils.showToast('Data siswa diperbarui', 'success');
        } else {
            const newId = Math.max(...AppData.users.map(u => u.id)) + 1;
            AppData.users.push({ id: newId, name, email, role: 'student', avatar: initials, nis, class: cls });
            Utils.showToast('Siswa baru berhasil ditambahkan', 'success');
        }

        Utils.closeModal();
        this.renderTable();
    },

    editStudent(id) {
        const student = AppData.users.find(u => u.id === id);
        if (student) this.showStudentForm(student);
    },

    deleteStudent(id) {
        const student = AppData.users.find(u => u.id === id);
        if (!student) return;

        Utils.openModal('Hapus Siswa', `<p>Hapus <strong>"${student.name}"</strong> dari data siswa?</p>`, `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
      <button class="btn btn-danger" onclick="StudentsPage.confirmDelete(${id})">Hapus</button>
    `);
    },

    confirmDelete(id) {
        AppData.users = AppData.users.filter(u => u.id !== id);
        Utils.closeModal();
        Utils.showToast('Siswa berhasil dihapus', 'success');
        this.renderTable();
    }
};
