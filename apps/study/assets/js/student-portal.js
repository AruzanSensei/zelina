/* ============================================
   STUDENT-PORTAL.JS — Student-side Pages
   ============================================ */

const StudentPortal = {
    // Exam-taking state
    currentExam: null,
    currentQuestions: [],
    currentAnswers: {},
    currentQuestionIndex: 0,
    timerInterval: null,
    timeRemaining: 0,

    // ---- Student Dashboard ----
    renderDashboard() {
        const user = AppData.currentUser;
        const myScores = AppData.scores.filter(s => s.studentId === user.id);
        const avgScore = myScores.length > 0 ? Math.round(myScores.reduce((a, s) => a + s.score, 0) / myScores.length) : 0;
        const availableExams = AppData.exams.filter(e => e.status === 'published' || e.status === 'active');

        const container = document.getElementById('page-s-dashboard');
        container.innerHTML = `
      <div style="margin-bottom:var(--space-6);">
        <h2 style="font-size:var(--text-xl);font-weight:var(--font-bold);margin-bottom:var(--space-1);">
          Selamat datang, ${user.name}! 👋
        </h2>
        <p style="color:var(--text-secondary);">Kelas ${user.class || '-'} • NIS ${user.nis || '-'}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-value">${availableExams.length}</div>
          <div class="stat-label">Ujian Tersedia</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">${myScores.length}</div>
          <div class="stat-label">Ujian Selesai</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-value">${avgScore}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>

      ${availableExams.length > 0 ? `
        <div class="card" style="margin-top:var(--space-5);">
          <div class="card-header">
            <h3>Ujian yang Tersedia</h3>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-4);">
              ${availableExams.slice(0, 3).map(e => `
                <div class="exam-card">
                  <div class="exam-subject">${e.subject}</div>
                  <div class="exam-title">${e.title}</div>
                  <div class="exam-meta">
                    <span>
                      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      ${Utils.formatShortDate(e.date)}
                    </span>
                    <span>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      ${e.duration} menit
                    </span>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="StudentPortal.startExam(${e.id})">
                    Mulai Ujian
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      ${myScores.length > 0 ? `
        <div class="card" style="margin-top:var(--space-5);">
          <div class="card-header">
            <h3>Nilai Terakhir</h3>
          </div>
          <div class="card-body no-padding">
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>Ujian</th><th>Nilai</th></tr>
                </thead>
                <tbody>
                  ${myScores.map(s => {
            const exam = Utils.getExam(s.examId);
            return `<tr>
                      <td class="cell-bold">${exam ? exam.title : '-'}</td>
                      <td><span class="badge badge-${s.score >= 80 ? 'green' : s.score >= 60 ? 'yellow' : 'red'}">${s.score}</span></td>
                    </tr>`;
        }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ` : ''}
    `;
    },

    // ---- Student Exam List ----
    renderExamList() {
        const exams = AppData.exams.filter(e => e.status === 'published' || e.status === 'active');
        const container = document.getElementById('page-s-exams');

        container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-5);">
        ${exams.length === 0 ? '<div class="empty-state"><p>Tidak ada ujian tersedia saat ini</p></div>' :
                exams.map(e => `
            <div class="exam-card">
              <div class="exam-subject">${e.subject}</div>
              <div class="exam-title">${e.title}</div>
              <div class="exam-meta">
                <span>
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  ${Utils.formatShortDate(e.date)}
                </span>
                <span>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${e.duration} menit
                </span>
                <span>
                  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Kelas ${e.class}
                </span>
              </div>
              ${Utils.statusBadge(e.status)}
              <div style="margin-top:var(--space-4);">
                <button class="btn btn-primary" onclick="StudentPortal.startExam(${e.id})">
                  <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Mulai Ujian
                </button>
              </div>
            </div>
          `).join('')}
      </div>
    `;
    },

    // ---- Start Exam ----
    startExam(examId) {
        const exam = Utils.getExam(examId);
        if (!exam) return;

        const questions = AppData.questions.filter(q => q.examId === examId);
        if (questions.length === 0) {
            Utils.showToast('Ujian ini belum memiliki soal', 'warning');
            return;
        }

        // Confirm 
        Utils.openModal('Mulai Ujian', `
      <div style="text-align:center;padding:var(--space-4);">
        <div style="font-size:2rem;margin-bottom:var(--space-4);">📝</div>
        <h3 style="margin-bottom:var(--space-2);">${exam.title}</h3>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-4);">${exam.subject} • ${questions.length} soal • ${exam.duration} menit</p>
        <p style="font-size:var(--text-sm);color:var(--text-tertiary);">Pastikan koneksi internet stabil. Setelah dimulai, waktu akan berjalan otomatis.</p>
      </div>
    `, `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="StudentPortal.confirmStartExam(${examId})">Mulai Sekarang</button>
    `);
    },

    confirmStartExam(examId) {
        Utils.closeModal();

        const exam = Utils.getExam(examId);
        const questions = AppData.questions.filter(q => q.examId === examId);

        this.currentExam = exam;
        this.currentQuestions = questions;
        this.currentAnswers = {};
        this.currentQuestionIndex = 0;
        this.timeRemaining = exam.duration * 60;

        // Show exam page
        App.navigateTo('s-take-exam');
        this.renderExamPage();
        this.startTimer();
    },

    renderExamPage() {
        const exam = this.currentExam;
        const questions = this.currentQuestions;
        const q = questions[this.currentQuestionIndex];
        const totalQ = questions.length;
        const answered = Object.keys(this.currentAnswers).length;

        const container = document.getElementById('page-s-take-exam');
        container.innerHTML = `
      <div class="exam-take-layout">
        <div class="exam-take-main">
          <!-- Timer -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);flex-wrap:wrap;gap:var(--space-3);">
            <div>
              <h2 style="font-size:var(--text-lg);font-weight:var(--font-semibold);">${exam.title}</h2>
              <p style="color:var(--text-secondary);font-size:var(--text-sm);">${exam.subject}</p>
            </div>
            <div class="exam-timer" id="exam-timer">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span id="timer-display">${this.formatTime(this.timeRemaining)}</span>
            </div>
          </div>

          <!-- Progress -->
          <div style="margin-bottom:var(--space-5);">
            <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);font-size:var(--text-sm);color:var(--text-secondary);">
              <span>Soal ${this.currentQuestionIndex + 1} dari ${totalQ}</span>
              <span>${answered} dijawab</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${(answered / totalQ) * 100}%"></div>
            </div>
          </div>

          <!-- Question -->
          <div class="question-card">
            <div class="question-number">Soal ${this.currentQuestionIndex + 1}</div>
            <div class="question-text">${q.questionText}</div>
            <div class="option-list">
              ${['A', 'B', 'C', 'D'].map(letter => {
            const optKey = 'option' + letter;
            const selected = this.currentAnswers[q.id] === letter;
            return `
                  <div class="option-item ${selected ? 'selected' : ''}" onclick="StudentPortal.selectAnswer(${q.id}, '${letter}')">
                    <span class="option-letter">${letter}</span>
                    <span>${q[optKey]}</span>
                  </div>
                `;
        }).join('')}
            </div>
          </div>

          <!-- Navigation -->
          <div style="display:flex;justify-content:space-between;margin-top:var(--space-5);">
            <button class="btn btn-secondary" onclick="StudentPortal.prevQuestion()" ${this.currentQuestionIndex === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
              ← Sebelumnya
            </button>
            ${this.currentQuestionIndex === totalQ - 1 ? `
              <button class="btn btn-success" onclick="StudentPortal.submitExam()">
                ✓ Kumpulkan Jawaban
              </button>
            ` : `
              <button class="btn btn-primary" onclick="StudentPortal.nextQuestion()">
                Selanjutnya →
              </button>
            `}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="exam-take-sidebar">
          <div class="card">
            <div class="card-header">
              <h3>Navigasi Soal</h3>
            </div>
            <div class="card-body">
              <div class="question-nav">
                ${questions.map((qq, i) => {
            const isAnswered = !!this.currentAnswers[qq.id];
            const isCurrent = i === this.currentQuestionIndex;
            return `<button class="q-dot ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}" onclick="StudentPortal.goToQuestion(${i})">${i + 1}</button>`;
        }).join('')}
              </div>
              <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-light);">
                <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-2);">
                  <span>Dijawab: ${answered}</span>
                  <span>Belum: ${totalQ - answered}</span>
                </div>
                <button class="btn btn-success btn-sm" style="width:100%;" onclick="StudentPortal.submitExam()">
                  Kumpulkan Jawaban
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    selectAnswer(questionId, letter) {
        this.currentAnswers[questionId] = letter;
        this.renderExamPage();
    },

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.renderExamPage();
        }
    },

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderExamPage();
        }
    },

    goToQuestion(index) {
        this.currentQuestionIndex = index;
        this.renderExamPage();
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            const display = document.getElementById('timer-display');
            const timerEl = document.getElementById('exam-timer');
            if (display) display.textContent = this.formatTime(this.timeRemaining);

            if (timerEl) {
                timerEl.classList.remove('warning', 'danger');
                if (this.timeRemaining <= 60) timerEl.classList.add('danger');
                else if (this.timeRemaining <= 300) timerEl.classList.add('warning');
            }

            if (this.timeRemaining <= 0) {
                this.submitExam(true);
            }
        }, 1000);
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    submitExam(autoSubmit = false) {
        const unanswered = this.currentQuestions.length - Object.keys(this.currentAnswers).length;

        if (!autoSubmit && unanswered > 0) {
            Utils.openModal('Konfirmasi', `
        <p>Masih ada <strong>${unanswered} soal</strong> yang belum dijawab. Yakin ingin mengumpulkan?</p>
      `, `
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Kembali</button>
        <button class="btn btn-primary" onclick="Utils.closeModal();StudentPortal.finalizeSubmit()">Ya, Kumpulkan</button>
      `);
        } else {
            if (autoSubmit) Utils.showToast('Waktu habis! Jawaban otomatis dikumpulkan.', 'warning');
            this.finalizeSubmit();
        }
    },

    finalizeSubmit() {
        clearInterval(this.timerInterval);

        // Calculate score
        let correct = 0;
        this.currentQuestions.forEach(q => {
            if (this.currentAnswers[q.id] === q.correctAnswer) correct++;
        });
        const score = Math.round((correct / this.currentQuestions.length) * 100);

        // Save score
        AppData.scores.push({
            id: AppData.nextScoreId++,
            studentId: AppData.currentUser.id,
            examId: this.currentExam.id,
            score: score,
        });

        // Save answers
        this.currentQuestions.forEach(q => {
            AppData.answers.push({
                id: AppData.nextAnswerId++,
                studentId: AppData.currentUser.id,
                questionId: q.id,
                answer: this.currentAnswers[q.id] || '',
            });
        });

        // Show result
        this.showResult(score, correct, this.currentQuestions.length);
    },

    showResult(score, correct, total) {
        const container = document.getElementById('page-s-take-exam');
        const cls = Utils.scoreClass(score);

        container.innerHTML = `
      <div class="card" style="max-width:500px;margin:var(--space-8) auto;">
        <div class="card-body">
          <div class="score-display">
            <div style="font-size:3rem;margin-bottom:var(--space-4);">🎉</div>
            <h2 style="margin-bottom:var(--space-6);">Ujian Selesai!</h2>
            <div class="score-circle ${cls}">${score}</div>
            <p style="font-size:var(--text-lg);font-weight:var(--font-semibold);margin-bottom:var(--space-2);">
              ${score >= 80 ? 'Luar biasa!' : score >= 60 ? 'Cukup baik!' : 'Perlu belajar lagi!'}
            </p>
            <p style="color:var(--text-secondary);margin-bottom:var(--space-6);">
              Benar: ${correct} dari ${total} soal
            </p>
            <div style="display:flex;gap:var(--space-3);justify-content:center;">
              <button class="btn btn-secondary" onclick="App.navigateTo('s-exams')">Daftar Ujian</button>
              <button class="btn btn-primary" onclick="App.navigateTo('s-dashboard')">Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    `;

        // Reset state
        this.currentExam = null;
        this.currentQuestions = [];
        this.currentAnswers = {};
        this.currentQuestionIndex = 0;
    },

    // ---- Student Grades ----
    renderGrades() {
        const user = AppData.currentUser;
        const myScores = AppData.scores.filter(s => s.studentId === user.id);

        const container = document.getElementById('page-s-grades');
        container.innerHTML = `
      ${myScores.length === 0 ? `
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              <p>Belum ada nilai. Mulai kerjakan ujian!</p>
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('s-exams')">Lihat Ujian</button>
            </div>
          </div>
        </div>
      ` : `
        <div class="stats-grid" style="margin-bottom:var(--space-5);">
          <div class="stat-card purple">
            <div class="stat-value">${Math.round(myScores.reduce((a, s) => a + s.score, 0) / myScores.length)}</div>
            <div class="stat-label">Rata-rata</div>
          </div>
          <div class="stat-card green">
            <div class="stat-value">${Math.max(...myScores.map(s => s.score))}</div>
            <div class="stat-label">Tertinggi</div>
          </div>
          <div class="stat-card pink">
            <div class="stat-value">${Math.min(...myScores.map(s => s.score))}</div>
            <div class="stat-label">Terendah</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Riwayat Nilai</h3>
          </div>
          <div class="card-body no-padding">
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Ujian</th>
                    <th>Mata Pelajaran</th>
                    <th>Tanggal</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  ${myScores.map(s => {
            const exam = Utils.getExam(s.examId);
            return `
                      <tr>
                        <td class="cell-bold">${exam ? exam.title : '-'}</td>
                        <td>${exam ? exam.subject : '-'}</td>
                        <td>${exam ? Utils.formatShortDate(exam.date) : '-'}</td>
                        <td><span class="badge badge-${s.score >= 80 ? 'green' : s.score >= 60 ? 'yellow' : 'red'}">${s.score}</span></td>
                      </tr>
                    `;
        }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `}
    `;
    }
};
