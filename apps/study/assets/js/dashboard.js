/* ============================================
   DASHBOARD.JS — Teacher Overview Page
   ============================================ */

const DashboardPage = {
    chartInstance: null,

    render() {
        const students = AppData.getStudents();
        const totalExams = AppData.exams.length;
        const avgScore = AppData.scores.length > 0
            ? Math.round(AppData.scores.reduce((s, r) => s + r.score, 0) / AppData.scores.length)
            : 0;
        const presentCount = AppData.attendance.filter(a => a.status === 'hadir').length;
        const totalAttendance = AppData.attendance.length;
        const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        const container = document.getElementById('page-overview');
        container.innerHTML = `
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span class="stat-trend up">↑ 12%</span>
          </div>
          <div class="stat-value">${students.length}</div>
          <div class="stat-label">Total Siswa</div>
        </div>

        <div class="stat-card green">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
            <span class="stat-trend up">↑ 5%</span>
          </div>
          <div class="stat-value">${totalExams}</div>
          <div class="stat-label">Total Ujian</div>
        </div>

        <div class="stat-card purple">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <span class="stat-trend ${avgScore >= 75 ? 'up' : 'down'}">${avgScore >= 75 ? '↑' : '↓'} ${avgScore}%</span>
          </div>
          <div class="stat-value">${avgScore}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>

        <div class="stat-card orange">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div class="stat-value">${attendanceRate}%</div>
          <div class="stat-label">Tingkat Kehadiran</div>
        </div>
      </div>

      <!-- Charts + Activity -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3>Distribusi Nilai</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-scores"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Aktivitas Terbaru</h3>
          </div>
          <div class="card-body">
            <ul class="activity-list">
              ${AppData.activities.map(a => `
                <li class="activity-item">
                  <div class="activity-dot ${a.type}"></div>
                  <div class="activity-text">${a.text}</div>
                  <div class="activity-time">${a.time}</div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Recent Exams Table -->
      <div class="card" style="margin-top:var(--space-5);">
        <div class="card-header">
          <h3>Ujian Terbaru</h3>
          <button class="btn btn-primary btn-sm" onclick="App.navigateTo('exams')">
            Lihat Semua
          </button>
        </div>
        <div class="card-body no-padding">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ujian</th>
                  <th>Mata Pelajaran</th>
                  <th>Kelas</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${AppData.exams.slice(0, 5).map(e => `
                  <tr>
                    <td class="cell-bold">${e.title}</td>
                    <td>${e.subject}</td>
                    <td>${e.class}</td>
                    <td>${Utils.formatShortDate(e.date)}</td>
                    <td>${Utils.statusBadge(e.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.renderChart();
    },

    renderChart() {
        // Destroy previous
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = document.getElementById('chart-scores');
        if (!ctx) return;

        // Score distribution
        const ranges = ['0-40', '41-60', '61-70', '71-80', '81-90', '91-100'];
        const counts = [0, 0, 0, 0, 0, 0];
        AppData.scores.forEach(s => {
            if (s.score <= 40) counts[0]++;
            else if (s.score <= 60) counts[1]++;
            else if (s.score <= 70) counts[2]++;
            else if (s.score <= 80) counts[3]++;
            else if (s.score <= 90) counts[4]++;
            else counts[5]++;
        });

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ranges,
                datasets: [{
                    label: 'Jumlah Siswa',
                    data: counts,
                    backgroundColor: [
                        'rgba(239,68,68,0.7)', 'rgba(249,115,22,0.7)', 'rgba(245,158,11,0.7)',
                        'rgba(59,130,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(139,92,246,0.7)'
                    ],
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { family: 'Inter', size: 12 }, color: '#94a3b8' },
                        grid: { color: 'rgba(0,0,0,0.04)' },
                    },
                    x: {
                        ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8' },
                        grid: { display: false },
                    }
                }
            }
        });
    }
};
