/**
 * UI Utilities - Notifications & Alerts
 */

export const showAlert = (message) => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    overlay.innerHTML = `
        <div class="custom-alert-card">
            <div class="custom-alert-message">${message}</div>
            <button class="btn btn-primary" style="width: 100%;">OK</button>
        </div>
    `;

    overlay.querySelector('button').onclick = () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 200);
    };

    container.appendChild(overlay);
};

export const showToast = (message) => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<span>${message}</span> <span class="check-icon">✅</span>`;

    // Clear existing toasts if any (optional based on UX preference)
    container.querySelectorAll('.custom-toast').forEach(t => t.remove());
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};
