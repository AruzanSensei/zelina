const Exams = {
  getAll() { return Storage.get('exams'); },
  getById(id) { return this.getAll().find(e => e.id === id); },
  add(data) {
    const exams = this.getAll();
    const exam = { id: 'e' + Date.now(), ...data, status: data.status || 'draft' };
    exams.push(exam);
    Storage.set('exams', exams);
    return exam;
  },
  update(id, data) {
    const exams = this.getAll().map(e => e.id === id ? { ...e, ...data } : e);
    Storage.set('exams', exams);
  },
  delete(id) {
    Storage.set('exams', this.getAll().filter(e => e.id !== id));
    Storage.set('questions', Questions.getAll().filter(q => q.examId !== id));
  },
  renderList(container) {
    const exams = this.getAll();
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Daftar Ujian</h2>
          <p class="subtitle">${exams.length} ujian tersimpan</p>
        </div>
        <button class="btn-primary" onclick="Exams.showForm()">
          <span>+</span> Buat Ujian
        </button>
      </div>
      <div class="card-table">
        <table>
          <thead><tr><th>Judul</th><th>Mata Pelajaran</th><th>Kelas</th><th>Tanggal</th><th>Durasi</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${exams.length ? exams.map(e => `
              <tr>
                <td><strong>${e.title}</strong></td>
                <td>${e.subject || '-'}</td>
                <td><span class="badge-class">${e.class || '-'}</span></td>
                <td>${e.date}</td>
                <td>${e.duration} menit</td>
                <td><span class="status-badge status-${e.status}">${e.status}</span></td>
                <td>
                  <button class="btn-icon" onclick="Exams.showForm('${e.id}')" title="Edit">✏️</button>
                  <button class="btn-icon danger" onclick="Exams.confirmDelete('${e.id}')" title="Hapus">🗑️</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="7" class="empty-row">Belum ada ujian</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  },
  showForm(id = null) {
    const exam = id ? this.getById(id) : null;
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>${exam ? 'Edit Ujian' : 'Buat Ujian Baru'}</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Judul Ujian</label>
            <input id="f-title" type="text" value="${exam?.title || ''}" placeholder="Contoh: Ulangan Harian Matematika">
          </div>
          <div class="form-row">
            <label>Mata Pelajaran</label>
            <input id="f-subject" type="text" value="${exam?.subject || ''}" placeholder="Contoh: Matematika">
          </div>
          <div class="form-grid">
            <div class="form-row">
              <label>Kelas</label>
              <select id="f-class">
                ${['X-A','X-B','XI-A','XI-B','XII-A','XII-B'].map(c => `<option value="${c}" ${exam?.class===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <label>Status</label>
              <select id="f-status">
                ${['draft','active','finished'].map(s => `<option value="${s}" ${(exam?.status||'draft')===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-row">
              <label>Tanggal</label>
              <input id="f-date" type="date" value="${exam?.date || ''}">
            </div>
            <div class="form-row">
              <label>Durasi (menit)</label>
              <input id="f-duration" type="number" value="${exam?.duration || 60}" min="1">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" onclick="closeModal()">Batal</button>
          <button class="btn-primary" onclick="Exams.save('${id || ''}')">Simpan</button>
        </div>
      </div>
    `;
    modal.classList.add('active');
  },
  save(id) {
    const data = {
      title: document.getElementById('f-title').value.trim(),
      subject: document.getElementById('f-subject').value.trim(),
      class: document.getElementById('f-class').value,
      status: document.getElementById('f-status').value,
      date: document.getElementById('f-date').value,
      duration: parseInt(document.getElementById('f-duration').value) || 60,
    };
    if (!data.title) { alert('Judul wajib diisi'); return; }
    if (id) this.update(id, data); else this.add(data);
    closeModal();
    navigate('exams');
  },
  confirmDelete(id) {
    const exam = this.getById(id);
    if (confirm(`Hapus ujian "${exam.title}"? Soal terkait juga akan dihapus.`)) {
      this.delete(id);
      navigate('exams');
    }
  }
};
