/* ============================================
   STATISTICS.JS — Statistics Page (Teacher)
   ============================================ */

const StatisticsPage = {
    charts: {},

    render() {
        const container = document.getElementById('page-statistics');

        const students = AppData.getStudents();
        const scores = AppData.scores;
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
        const maxScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
        const minScore = scores.length > 0 ? Math.min(...scores.map(s => s.score)) : 0;
        const passCount = scores.filter(s => s.score >= 70).length;
        const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

        container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-value">${avgScore}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">${maxScore}</div>
          <div class="stat-label">Nilai Tertinggi</div>
        </div>
        <div class="stat-card pink">
          <div class="stat-value">${minScore}</div>
          <div class="stat-label">Nilai Terendah</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-value">${passRate}%</div>
          <div class="stat-label">Tingkat Kelulusan</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3>Distribusi Nilai per Ujian</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-exam-avg"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Siswa per Kelas</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-class-dist"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:var(--space-5);">
        <div class="card-header">
          <h3>Top 10 Siswa</h3>
        </div>
        <div class="card-body no-padding">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Peringkat</th>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Rata-rata Nilai</th>
                </tr>
              </thead>
              <tbody id="top-students-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderTopStudents();
        this.renderCharts();
    },

    renderTopStudents() {
        // Aggregate scores per student
        const studentScores = {};
        AppData.scores.forEach(s => {
            if (!studentScores[s.studentId]) studentScores[s.studentId] = [];
            studentScores[s.studentId].push(s.score);
        });

        const ranked = Object.entries(studentScores).map(([id, scores]) => {
            const student = Utils.getStudent(parseInt(id));
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            return { student, avg };
        }).filter(r => r.student)
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 10);

        const tbody = document.getElementById('top-students-tbody');
        if (!tbody) return;

        tbody.innerHTML = ranked.map((r, i) => `
      <tr>
        <td>
          <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${i < 3 ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'var(--gray-100)'};color:${i < 3 ? 'white' : 'var(--text-secondary)'};font-weight:600;font-size:12px;">
            ${i + 1}
          </span>
        </td>
        <td class="cell-bold">${r.student.name}</td>
        <td>${r.student.class}</td>
        <td><span class="badge badge-${r.avg >= 80 ? 'green' : r.avg >= 60 ? 'yellow' : 'red'}">${r.avg}</span></td>
      </tr>
    `).join('');
    },

    renderCharts() {
        // Destroy previous
        Object.values(this.charts).forEach(c => c.destroy());
        this.charts = {};

        // Exam averages
        const examAvgs = {};
        AppData.scores.forEach(s => {
            if (!examAvgs[s.examId]) examAvgs[s.examId] = [];
            examAvgs[s.examId].push(s.score);
        });

        const examLabels = [];
        const examData = [];
        Object.entries(examAvgs).forEach(([id, scores]) => {
            const exam = Utils.getExam(parseInt(id));
            if (exam) {
                examLabels.push(exam.title.length > 15 ? exam.title.slice(0, 15) + '...' : exam.title);
                examData.push(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
            }
        });

        const ctx1 = document.getElementById('chart-exam-avg');
        if (ctx1) {
            this.charts.examAvg = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: examLabels,
                    datasets: [{
                        label: 'Rata-rata',
                        data: examData,
                        backgroundColor: Utils.chartColors.slice(0, examLabels.length).map(c => c + 'cc'),
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, max: 100, ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8' }, grid: { color: 'rgba(0,0,0,0.04)' } },
                        x: { ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }, grid: { display: false } }
                    }
                }
            });
        }

        // Class distribution (doughnut)
        const classCounts = {};
        AppData.getStudents().forEach(s => {
            classCounts[s.class] = (classCounts[s.class] || 0) + 1;
        });

        const ctx2 = document.getElementById('chart-class-dist');
        if (ctx2) {
            this.charts.classDist = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(classCounts),
                    datasets: [{
                        data: Object.values(classCounts),
                        backgroundColor: Utils.chartColors.slice(0, Object.keys(classCounts).length),
                        borderWidth: 0,
                        hoverOffset: 8,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, color: '#475569', padding: 16 } }
                    },
                    cutout: '60%',
                }
            });
        }
    }
};

/* ============================================
   SETTINGS PAGE (Simple)
   ============================================ */
const SettingsPage = {
    render() {
        const container = document.getElementById('page-settings');
        container.innerHTML = `
      <div class="card" style="max-width:640px;">
        <div class="card-header">
          <h3>Pengaturan Profil</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Nama</label>
            <input type="text" class="form-control" value="${AppData.currentUser?.name || ''}" id="setting-name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" value="${AppData.currentUser?.email || ''}" id="setting-email">
          </div>
          <button class="btn btn-primary" onclick="SettingsPage.save()">Simpan Perubahan</button>
        </div>
      </div>

      <div class="card" style="max-width:640px;margin-top:var(--space-5);">
        <div class="card-header">
          <h3>Informasi Sistem</h3>
        </div>
        <div class="card-body">
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-3);">
            <strong>StudyLab</strong> v1.0.0<br>
            Sistem Ujian Sekolah Online<br>
            Frontend: HTML, CSS, Vanilla JS<br>
            Database: Supabase (segera)<br>
            API: Cloudflare Worker (segera)
          </p>
          <p style="color:var(--text-tertiary);font-size:var(--text-xs);">
            © 2026 StudyLab. All rights reserved.
          </p>
        </div>
      </div>
    `;
    },

    save() {
        const name = document.getElementById('setting-name')?.value.trim();
        const email = document.getElementById('setting-email')?.value.trim();
        if (name && AppData.currentUser) {
            AppData.currentUser.name = name;
            AppData.currentUser.email = email || AppData.currentUser.email;
            document.getElementById('user-name').textContent = name;
            const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            AppData.currentUser.avatar = initials;
            document.getElementById('user-avatar').textContent = initials;
        }
        Utils.showToast('Pengaturan berhasil disimpan', 'success');
    }
};
