/* ============================================
   APP.JS — SPA Router + Initialization
   ============================================ */

const App = {
    currentPage: null,

    pageTitles: {
        'overview': 'Overview',
        'exams': 'Manajemen Ujian',
        'questions': 'Bank Soal',
        'grades': 'Nilai Siswa',
        'attendance': 'Absensi',
        'students': 'Data Siswa',
        'statistics': 'Statistik',
        'settings': 'Pengaturan',
        's-dashboard': 'Dashboard',
        's-exams': 'Daftar Ujian',
        's-take-exam': 'Kerjakan Ujian',
        's-grades': 'Nilai Saya',
    },

    init() {
        Auth.init();
        this.bindNavigation();
        this.bindSidebar();
    },

    bindNavigation() {
        // Sidebar nav items
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item[data-page]');
            if (navItem) {
                const page = navItem.dataset.page;
                this.navigateTo(page);
            }
        });
    },

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Show target page
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.classList.add('active');
        }

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (navBtn) navBtn.classList.add('active');

        // Update page title
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = this.pageTitles[page] || page;

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');

        this.currentPage = page;

        // Render page content
        this.renderPage(page);
    },

    renderPage(page) {
        switch (page) {
            case 'overview':
                DashboardPage.render();
                break;
            case 'exams':
                ExamsPage.render();
                break;
            case 'questions':
                QuestionsPage.render();
                break;
            case 'grades':
                GradesPage.render();
                break;
            case 'attendance':
                AttendancePage.render();
                break;
            case 'students':
                StudentsPage.render();
                break;
            case 'statistics':
                StatisticsPage.render();
                break;
            case 'settings':
                SettingsPage.render();
                break;
            case 's-dashboard':
                StudentPortal.renderDashboard();
                break;
            case 's-exams':
                StudentPortal.renderExamList();
                break;
            case 's-grades':
                StudentPortal.renderGrades();
                break;
            // s-take-exam is rendered by StudentPortal.confirmStartExam
        }
    },

    bindSidebar() {
        // Hamburger toggle
        document.getElementById('hamburger-btn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebar-overlay').classList.toggle('open');
        });

        // Overlay click to close
        document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('open');
        });
    }
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
