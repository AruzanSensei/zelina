const Quiz = {
  state: { examId: null, questions: [], answers: {}, current: 0, timerInterval: null, timeLeft: 0 },

  start(examId) {
    const exam = Exams.getById(examId);
    const questions = Questions.getByExam(examId);
    if (!questions.length) { alert('Ujian ini belum memiliki soal.'); return; }
    this.state = { examId, exam, questions, answers: {}, current: 0, timerInterval: null, timeLeft: exam.duration * 60 };
    this.render();
    this.startTimer();
  },

  startTimer() {
    clearInterval(this.state.timerInterval);
    this.state.timerInterval = setInterval(() => {
      this.state.timeLeft--;
      this.updateTimer();
      if (this.state.timeLeft <= 0) { this.submit(); }
    }, 1000);
  },

  updateTimer() {
    const el = document.getElementById('quiz-timer');
    if (!el) return;
    const m = Math.floor(this.state.timeLeft / 60).toString().padStart(2, '0');
    const s = (this.state.timeLeft % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
    el.className = 'timer' + (this.state.timeLeft < 120 ? ' timer-warn' : '');
  },

  render() {
    const { exam, questions, answers, current } = this.state;
    const q = questions[current];
    const total = questions.length;
    const answered = Object.keys(answers).length;
    document.getElementById('main-content').innerHTML = `
      <div class="quiz-layout">
        <div class="quiz-header">
          <div class="quiz-title">
            <h2>${exam.title}</h2>
            <p>${exam.subject} · ${exam.class}</p>
          </div>
          <div id="quiz-timer" class="timer">--:--</div>
        </div>
        <div class="quiz-body">
          <div class="quiz-main">
            <div class="q-progress-bar">
              <div class="q-progress-fill" style="width:${((current+1)/total)*100}%"></div>
            </div>
            <div class="quiz-question-card">
              <div class="q-num-badge">Soal ${current + 1} / ${total}</div>
              <p class="quiz-q-text">${q.question}</p>
              <div class="quiz-options">
                ${q.options.map((opt, i) => `
                  <label class="quiz-option ${answers[q.id] === i ? 'selected' : ''}">
                    <input type="radio" name="qans" value="${i}" ${answers[q.id] === i ? 'checked' : ''} 
                      onchange="Quiz.answer('${q.id}', ${i})">
                    <span class="opt-circle">${String.fromCharCode(65+i)}</span>
                    <span>${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="quiz-nav">
              <button class="btn-ghost" onclick="Quiz.go(${current - 1})" ${current===0?'disabled':''}>← Sebelumnya</button>
              <span class="answered-count">${answered}/${total} dijawab</span>
              ${current < total - 1
                ? `<button class="btn-primary" onclick="Quiz.go(${current + 1})">Selanjutnya →</button>`
                : `<button class="btn-submit" onclick="Quiz.confirmSubmit()">Submit Ujian ✓</button>`
              }
            </div>
          </div>
          <div class="quiz-sidebar">
            <p class="q-sidebar-title">Navigasi Soal</p>
            <div class="q-nav-grid">
              ${questions.map((qx, i) => `
                <button class="q-nav-btn ${i===current?'active':''} ${answers[qx.id]!==undefined?'done':''}" 
                  onclick="Quiz.go(${i})">${i+1}</button>
              `).join('')}
            </div>
            <button class="btn-submit w-full mt-4" onclick="Quiz.confirmSubmit()">Submit Ujian</button>
          </div>
        </div>
      </div>
    `;
    this.updateTimer();
  },

  answer(qId, val) {
    this.state.answers[qId] = val;
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      el.classList.toggle('selected', i === val);
    });
    const answered = Object.keys(this.state.answers).length;
    const total = this.state.questions.length;
    document.querySelector('.answered-count').textContent = `${answered}/${total} dijawab`;
    const navBtns = document.querySelectorAll('.q-nav-btn');
    if (navBtns[this.state.current]) navBtns[this.state.current].classList.add('done');
  },

  go(idx) {
    if (idx < 0 || idx >= this.state.questions.length) return;
    this.state.current = idx;
    this.render();
  },

  confirmSubmit() {
    const answered = Object.keys(this.state.answers).length;
    const total = this.state.questions.length;
    const unanswered = total - answered;
    const msg = unanswered > 0 
      ? `Masih ada ${unanswered} soal belum dijawab. Submit sekarang?`
      : 'Yakin ingin submit ujian?';
    if (confirm(msg)) this.submit();
  },

  submit() {
    clearInterval(this.state.timerInterval);
    const { examId, exam, questions, answers } = this.state;
    let correct = 0;
    questions.forEach(q => { if (answers[q.id] === q.correctAnswer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const result = {
      id: 'sc' + Date.now(),
      examId,
      examTitle: exam.title,
      studentName: document.getElementById('student-name-display')?.textContent || 'Murid',
      totalQuestions: questions.length,
      correct,
      score,
      answers,
      submittedAt: new Date().toISOString()
    };
    const scores = Storage.get('scores');
    scores.push(result);
    Storage.set('scores', scores);
    this.showResult(result, questions);
  },

  showResult(result, questions) {
    const grade = result.score >= 90 ? 'A' : result.score >= 80 ? 'B' : result.score >= 70 ? 'C' : result.score >= 60 ? 'D' : 'E';
    const gradeColor = result.score >= 70 ? '#22c55e' : '#ef4444';
    document.getElementById('main-content').innerHTML = `
      <div class="result-page">
        <div class="result-card">
          <div class="result-icon">${result.score >= 70 ? '🎉' : '📝'}</div>
          <h2>Ujian Selesai!</h2>
          <p class="result-exam-name">${result.examTitle}</p>
          <div class="result-score-big" style="color:${gradeColor}">${result.score}</div>
          <div class="result-grade" style="background:${gradeColor}">Grade ${grade}</div>
          <div class="result-stats">
            <div class="r-stat"><span>${result.correct}</span><small>Benar</small></div>
            <div class="r-stat"><span>${result.totalQuestions - result.correct}</span><small>Salah</small></div>
            <div class="r-stat"><span>${result.totalQuestions}</span><small>Total</small></div>
          </div>
        </div>
        <div class="result-detail">
          <h3>Detail Jawaban</h3>
          ${questions.map((q, i) => {
            const userAns = result.answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            return `
              <div class="detail-card ${isCorrect ? 'correct' : 'wrong'}">
                <div class="detail-num">${i+1}</div>
                <div class="detail-body">
                  <p>${q.question}</p>
                  <p class="detail-answer">
                    Jawaban kamu: <strong>${userAns !== undefined ? String.fromCharCode(65+userAns) + '. ' + q.options[userAns] : 'Tidak dijawab'}</strong>
                    ${!isCorrect ? ` · Jawaban benar: <strong class="correct-ans">${String.fromCharCode(65+q.correctAnswer)}. ${q.options[q.correctAnswer]}</strong>` : ''}
                  </p>
                </div>
                <div class="detail-icon">${isCorrect ? '✓' : '✗'}</div>
              </div>
            `;
          }).join('')}
        </div>
        <button class="btn-primary mt-4" onclick="navigate('student-exams')">← Kembali ke Daftar Ujian</button>
      </div>
    `;
  }
};
