const Questions = {
  getAll() { return Storage.get('questions'); },
  getByExam(examId) { return this.getAll().filter(q => q.examId === examId); },
  add(data) {
    const qs = this.getAll();
    const q = { id: 'q' + Date.now(), ...data };
    qs.push(q);
    Storage.set('questions', qs);
    return q;
  },
  update(id, data) {
    Storage.set('questions', this.getAll().map(q => q.id === id ? { ...q, ...data } : q));
  },
  delete(id) {
    Storage.set('questions', this.getAll().filter(q => q.id !== id));
  },
  renderList(container, examId = null) {
    const exams = Exams.getAll();
    const selectedExam = examId ? Exams.getById(examId) : (exams[0] || null);
    const questions = selectedExam ? this.getByExam(selectedExam.id) : [];
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Bank Soal</h2>
          <p class="subtitle">${questions.length} soal untuk ujian ini</p>
        </div>
        <button class="btn-primary" onclick="Questions.showForm('${selectedExam?.id || ''}')">
          <span>+</span> Tambah Soal
        </button>
      </div>
      <div class="exam-selector">
        <label>Pilih Ujian:</label>
        <select onchange="Questions.renderList(document.getElementById('main-content'), this.value)">
          ${exams.map(e => `<option value="${e.id}" ${e.id===selectedExam?.id?'selected':''}>${e.title}</option>`).join('')}
        </select>
      </div>
      <div class="questions-list">
        ${questions.length ? questions.map((q, i) => `
          <div class="question-card">
            <div class="q-number">${i + 1}</div>
            <div class="q-body">
              <p class="q-text">${q.question}</p>
              <div class="q-options">
                ${q.options.map((opt, idx) => `
                  <span class="q-opt ${idx === q.correctAnswer ? 'correct' : ''}">
                    ${String.fromCharCode(65+idx)}. ${opt}
                  </span>
                `).join('')}
              </div>
            </div>
            <div class="q-actions">
              <button class="btn-icon" onclick="Questions.showForm('${selectedExam?.id}', '${q.id}')">✏️</button>
              <button class="btn-icon danger" onclick="Questions.confirmDelete('${q.id}', '${selectedExam?.id}')">🗑️</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state"><p>Belum ada soal. Tambah soal untuk ujian ini.</p></div>'}
      </div>
    `;
  },
  showForm(examId, qId = null) {
    const q = qId ? this.getAll().find(x => x.id === qId) : null;
    const opts = q?.options || ['', '', '', ''];
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <h3>${q ? 'Edit Soal' : 'Tambah Soal'}</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Pertanyaan</label>
            <textarea id="f-question" rows="3" placeholder="Tulis pertanyaan di sini...">${q?.question || ''}</textarea>
          </div>
          <div class="form-row">
            <label>Pilihan Jawaban</label>
            ${opts.map((opt, i) => `
              <div class="option-row">
                <span class="opt-label">${String.fromCharCode(65+i)}</span>
                <input id="f-opt-${i}" type="text" value="${opt}" placeholder="Pilihan ${String.fromCharCode(65+i)}">
                <label class="radio-label">
                  <input type="radio" name="correct" value="${i}" ${(q?.correctAnswer??0)===i?'checked':''}> Benar
                </label>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" onclick="closeModal()">Batal</button>
          <button class="btn-primary" onclick="Questions.save('${examId}', '${qId || ''}')">Simpan</button>
        </div>
      </div>
    `;
    modal.classList.add('active');
  },
  save(examId, qId) {
    const question = document.getElementById('f-question').value.trim();
    if (!question) { alert('Pertanyaan wajib diisi'); return; }
    const options = [0,1,2,3].map(i => document.getElementById(`f-opt-${i}`).value.trim());
    if (options.some(o => !o)) { alert('Semua pilihan wajib diisi'); return; }
    const correctAnswer = parseInt(document.querySelector('input[name="correct"]:checked')?.value ?? 0);
    const data = { examId, question, options, correctAnswer };
    if (qId) this.update(qId, data); else this.add(data);
    closeModal();
    this.renderList(document.getElementById('main-content'), examId);
  },
  confirmDelete(qId, examId) {
    if (confirm('Hapus soal ini?')) {
      this.delete(qId);
      this.renderList(document.getElementById('main-content'), examId);
    }
  }
};
