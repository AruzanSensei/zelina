/* ============================================
   AUTH.JS — Mock Authentication
   ============================================ */

const Auth = {
    selectedRole: 'teacher',

    init() {
        // Role selector toggle
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRole = btn.dataset.role;
            });
        });

        // Google login button
        document.getElementById('google-login-btn').addEventListener('click', () => {
            this.login(this.selectedRole);
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    },

    login(role) {
        if (role === 'teacher') {
            AppData.currentUser = AppData.users[0]; // Pak Ahmad
        } else {
            AppData.currentUser = AppData.users[2]; // Budi
        }

        // Update UI
        document.getElementById('user-avatar').textContent = AppData.currentUser.avatar;
        document.getElementById('user-name').textContent = AppData.currentUser.name;
        document.getElementById('user-role-label').textContent = role === 'teacher' ? 'Guru' : 'Murid';

        // Show/hide navs
        document.getElementById('teacher-nav').style.display = role === 'teacher' ? '' : 'none';
        document.getElementById('student-nav').style.display = role === 'student' ? '' : 'none';

        // Switch to app
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-shell').style.display = 'flex';

        // Navigate to first page
        const firstPage = role === 'teacher' ? 'overview' : 's-dashboard';
        App.navigateTo(firstPage);

        Utils.showToast(`Selamat datang, ${AppData.currentUser.name}!`, 'success');
    },

    logout() {
        AppData.currentUser = null;
        document.getElementById('app-shell').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';

        // Reset role selector
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('role-teacher').classList.add('active');
        this.selectedRole = 'teacher';

        // Destroy all charts
        if (typeof Chart !== 'undefined') {
            Object.values(Chart.instances).forEach(c => c.destroy());
        }
    },

    isTeacher() {
        return AppData.currentUser && AppData.currentUser.role === 'teacher';
    },

    isStudent() {
        return AppData.currentUser && AppData.currentUser.role === 'student';
    }
};
