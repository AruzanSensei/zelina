// ============================================================
// components/modal.js — Confirmation modal
// ============================================================

function showConfirmModal({ title, message, confirmText = 'Konfirmasi', confirmClass = 'btn btn-danger', onConfirm, onCancel }) {
  // Remove existing modal if any
  const existing = document.getElementById('confirm-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-modal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">${title}</div>
      <div class="modal-body">${message}</div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="modal-cancel">Batal</button>
        <button class="${confirmClass}" id="modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Show with animation
  requestAnimationFrame(() => overlay.classList.add('active'));

  function close() {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 200);
  }

  document.getElementById('modal-cancel').addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  document.getElementById('modal-confirm').addEventListener('click', () => {
    close();
    if (onConfirm) onConfirm();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { close(); if (onCancel) onCancel(); }
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      close();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', escHandler);
    }
  });
}
