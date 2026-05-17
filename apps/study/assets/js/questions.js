/* ============================================
   QUESTIONS.JS — Question Bank (Teacher)
   ============================================ */

const QuestionsPage = {
    selectedExamId: null,

    render() {
        const container = document.getElementById('page-questions');
        const exams = AppData.exams;

        container.innerHTML = `
      <div class="page-toolbar">
        <div class="toolbar-left">
          <select class="form-control" id="q-exam-filter" style="width:260px;">
            <option value="">Semua Ujian</option>
            ${exams.map(e => `<option value="${e.id}">${e.title} (${e.subject})</option>`).join('')}
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" id="add-question-btn">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Soal
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body no-padding">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pertanyaan</th>
                  <th>Ujian</th>
                  <th>Tipe</th>
                  <th>Jawaban</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="questions-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderTable();
        this.bindEvents();
    },

    renderTable() {
        let questions = AppData.questions;
        if (this.selectedExamId) {
            questions = questions.filter(q => q.examId === parseInt(this.selectedExamId));
        }

        const tbody = document.getElementById('questions-tbody');
        if (!tbody) return;

        if (questions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>Belum ada soal</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = questions.map((q, i) => {
            const exam = Utils.getExam(q.examId);
            return `
        <tr>
          <td>${i + 1}</td>
          <td class="cell-bold" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${q.questionText}</td>
          <td>${exam ? exam.title : '-'}</td>
          <td><span class="badge badge-blue">Pilihan Ganda</span></td>
          <td><span class="badge badge-green">${q.correctAnswer}</span></td>
          <td>
            <div class="cell-actions">
              <button class="btn-icon" title="Edit" onclick="QuestionsPage.editQuestion(${q.id})">
                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon" title="Hapus" onclick="QuestionsPage.deleteQuestion(${q.id})">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
        }).join('');
    },

    bindEvents() {
        document.getElementById('q-exam-filter')?.addEventListener('change', (e) => {
            this.selectedExamId = e.target.value;
            this.renderTable();
        });

        document.getElementById('add-question-btn')?.addEventListener('click', () => this.showQuestionForm());
    },

    showQuestionForm(question = null) {
        const isEdit = !!question;
        const exams = AppData.exams;

        const body = `
      <div class="form-group">
        <label for="q-exam">Ujian</label>
        <select class="form-control" id="q-exam">
          ${exams.map(e => `<option value="${e.id}" ${question && question.examId === e.id ? 'selected' : ''}>${e.title}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="q-text">Pertanyaan</label>
        <textarea class="form-control" id="q-text" rows="3" placeholder="Tulis pertanyaan...">${question ? question.questionText : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="q-opt-a">Pilihan A</label>
          <input type="text" class="form-control" id="q-opt-a" value="${question ? question.optionA : ''}">
        </div>
        <div class="form-group">
          <label for="q-opt-b">Pilihan B</label>
          <input type="text" class="form-control" id="q-opt-b" value="${question ? question.optionB : ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="q-opt-c">Pilihan C</label>
          <input type="text" class="form-control" id="q-opt-c" value="${question ? question.optionC : ''}">
        </div>
        <div class="form-group">
          <label for="q-opt-d">Pilihan D</label>
          <input type="text" class="form-control" id="q-opt-d" value="${question ? question.optionD : ''}">
        </div>
      </div>
      <div class="form-group">
        <label for="q-answer">Jawaban Benar</label>
        <select class="form-control" id="q-answer" style="width:120px;">
          <option value="A" ${question && question.correctAnswer === 'A' ? 'selected' : ''}>A</option>
          <option value="B" ${question && question.correctAnswer === 'B' ? 'selected' : ''}>B</option>
          <option value="C" ${question && question.correctAnswer === 'C' ? 'selected' : ''}>C</option>
          <option value="D" ${question && question.correctAnswer === 'D' ? 'selected' : ''}>D</option>
        </select>
      </div>
    `;

        const footer = `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="QuestionsPage.saveQuestion(${question ? question.id : 'null'})">${isEdit ? 'Simpan' : 'Tambah Soal'}</button>
    `;

        Utils.openModal(isEdit ? 'Edit Soal' : 'Tambah Soal Baru', body, footer);
    },

    saveQuestion(id) {
        const examId = parseInt(document.getElementById('q-exam').value);
        const questionText = document.getElementById('q-text').value.trim();
        const optionA = document.getElementById('q-opt-a').value.trim();
        const optionB = document.getElementById('q-opt-b').value.trim();
        const optionC = document.getElementById('q-opt-c').value.trim();
        const optionD = document.getElementById('q-opt-d').value.trim();
        const correctAnswer = document.getElementById('q-answer').value;

        if (!questionText || !optionA || !optionB || !optionC || !optionD) {
            Utils.showToast('Harap isi semua field', 'error');
            return;
        }

        if (id) {
            const q = AppData.questions.find(q => q.id === id);
            if (q) {
                Object.assign(q, { examId, questionText, optionA, optionB, optionC, optionD, correctAnswer });
            }
            Utils.showToast('Soal berhasil diperbarui', 'success');
        } else {
            AppData.questions.push({
                id: AppData.nextQuestionId++,
                examId, questionText, optionA, optionB, optionC, optionD, correctAnswer,
                type: 'multiple_choice'
            });
            Utils.showToast('Soal berhasil ditambahkan', 'success');
        }

        Utils.closeModal();
        this.renderTable();
    },

    editQuestion(id) {
        const q = AppData.questions.find(q => q.id === id);
        if (q) this.showQuestionForm(q);
    },

    deleteQuestion(id) {
        AppData.questions = AppData.questions.filter(q => q.id !== id);
        Utils.showToast('Soal berhasil dihapus', 'success');
        this.renderTable();
    }
};
