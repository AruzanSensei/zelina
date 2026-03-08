/* ============================================
   UTILS.JS — Toast, Modal, Export, Helpers
   ============================================ */

const Utils = {
    // ---- Toast Notifications ----
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // ---- Modal System ----
    openModal(title, bodyHTML, footerHTML = '') {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHTML;
        document.getElementById('modal-footer').innerHTML = footerHTML;
        document.getElementById('modal-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('open');
        document.body.style.overflow = '';
    },

    // ---- Format Helpers ----
    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatShortDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    // ---- Status Badges ----
    statusBadge(status) {
        const map = {
            'draft': '<span class="badge badge-gray">Draft</span>',
            'published': '<span class="badge badge-blue">Published</span>',
            'active': '<span class="badge badge-green">Active</span>',
            'finished': '<span class="badge badge-purple">Finished</span>',
            'hadir': '<span class="badge badge-green">Hadir</span>',
            'tidak hadir': '<span class="badge badge-red">Tidak Hadir</span>',
            'izin': '<span class="badge badge-yellow">Izin</span>',
            'not_started': '<span class="badge badge-gray">Belum Mulai</span>',
            'in_progress': '<span class="badge badge-blue">Sedang Mengerjakan</span>',
            'submitted': '<span class="badge badge-green">Selesai</span>',
        };
        return map[status] || `<span class="badge badge-gray">${status}</span>`;
    },

    // ---- Score Color ----
    scoreClass(score) {
        if (score >= 80) return 'good';
        if (score >= 60) return 'avg';
        return 'low';
    },

    // ---- Export CSV ----
    exportCSV(filename, headers, rows) {
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showToast(`File ${filename} berhasil diunduh`, 'success');
    },

    // ---- Get student by ID ----
    getStudent(id) {
        return AppData.users.find(u => u.id === id && u.role === 'student');
    },

    // ---- Get exam by ID ----
    getExam(id) {
        return AppData.exams.find(e => e.id === id);
    },

    // ---- Debounce ----
    debounce(fn, ms = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), ms);
        };
    },

    // ---- Generate placeholder chart colors ----
    chartColors: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
    ],

    chartColorsLight: [
        'rgba(59,130,246,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)',
        'rgba(239,68,68,0.15)', 'rgba(139,92,246,0.15)', 'rgba(6,182,212,0.15)',
        'rgba(236,72,153,0.15)', 'rgba(20,184,166,0.15)', 'rgba(249,115,22,0.15)',
        'rgba(99,102,241,0.15)'
    ],
};

// Setup modal close listeners
document.getElementById('modal-close').addEventListener('click', () => Utils.closeModal());
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) Utils.closeModal();
});
