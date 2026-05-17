// ============================================
// STORAGE - Local Storage Management
// ============================================

/**
 * Muat nama pengguna dari localStorage
 * @returns {string} Nama pengguna yang disimpan
 */
function loadUserName() {
  const stored = localStorage.getItem('corpolution_userName');
  if (stored) {
    return stored;
  }
  return '';
}

/**
 * Simpan nama pengguna ke localStorage
 * @param {string} name - Nama pengguna
 */
function saveUserName(name) {
  localStorage.setItem('corpolution_userName', name);
}

/**
 * Simpan nilai input ke localStorage
 * @param {string} inputId - ID dari input element
 * @param {string} value - Nilai yang akan disimpan
 */
function saveInputValue(inputId, value) {
  localStorage.setItem(`corpolution_${inputId}`, value);
}

/**
 * Ambil nilai input dari localStorage
 * @param {string} inputId - ID dari input element
 * @returns {string} Nilai yang disimpan, atau string kosong jika tidak ada
 */
function getInputValue(inputId) {
  return localStorage.getItem(`corpolution_${inputId}`) || '';
}

/**
 * Hapus nilai input dari localStorage
 * @param {string} inputId - ID dari input element
 */
function removeInputValue(inputId) {
  localStorage.removeItem(`corpolution_${inputId}`);
}
