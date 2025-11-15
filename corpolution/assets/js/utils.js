// ============================================
// UTILS - Date and Time Formatting Functions
// ============================================

/**
 * Format tanggal hari ini dalam bahasa Indonesia
 * Format: "13 November 2025"
 */
function formatTodayIndonesia() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const today = new Date();
  const dayName = days[today.getDay()];
  const date = today.getDate();
  const monthName = months[today.getMonth()];
  const year = today.getFullYear();
  
  return `${date} ${monthName} ${year}`;
}

/**
 * Format waktu menjadi format HH.MM
 * @param {Date} date - Object tanggal
 * @returns {string} Format "HH.MM"
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}

/**
 * Dapatkan range waktu otomatis (5 menit lalu hingga sekarang)
 * Digunakan untuk auto-fill pada input "Baca Buku"
 * @returns {Object} { startTime: "HH.MM", endTime: "HH.MM" }
 */
function getAutoTimeRange() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
  
  const startTime = formatTime(fiveMinutesAgo);
  const endTime = formatTime(now);
  
  return { startTime, endTime };
}

/**
 * Auto-expand textarea berdasarkan content height
 * Textarea akan bertambah tinggi otomatis saat ada text baru
 * @param {HTMLElement} textarea - Textarea element
 */
function autoExpandTextarea(textarea) {
  // Reset height dulu untuk mendapat scrollHeight yang akurat
  textarea.style.height = 'auto';
  // Set height sesuai content
  textarea.style.height = textarea.scrollHeight + 'px';
}
