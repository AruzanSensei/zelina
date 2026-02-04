// ============================================
// VALIDATION - Input Validation & Visual Feedback
// ============================================

/**
 * Validasi input fields - return array dari input yang kosong
 * @param {Object} template - Template object
 * @returns {Array} Array dari input configs yang kosong
 */
function validateInputs(template) {
  const emptyInputs = [];
  if (template.inputs) {
    template.inputs.forEach((inputConfig) => {
      const element = document.getElementById(inputConfig.id);
      if (!element || !element.value.trim()) {
        emptyInputs.push(inputConfig);
      }
    });
  }
  return emptyInputs;
}

/**
 * Update border color input berdasarkan apakah terisi atau tidak
 * Terisi (ada nilai) = border hijau (.input-filled)
 * Kosong = border merah (.input-empty)
 * Skip untuk select element karena tidak perlu visual feedback border
 * @param {HTMLElement} inputElement - Input element
 */
function updateInputBorderColor(inputElement) {
  // Skip select elements
  if (inputElement.tagName === 'SELECT') {
    return;
  }

  if (inputElement.value.trim()) {
    // Terisi - border hijau
    inputElement.classList.remove('input-empty');
    inputElement.classList.add('input-filled');
  } else {
    // Kosong - border merah
    inputElement.classList.remove('input-filled');
    inputElement.classList.add('input-empty');
  }
}

/**
 * Handle ketika ada input kosong saat copy
 * Menampilkan alert, expand card, dan focus ke input pertama yang kosong
 * @param {Object} template - Template object
 * @param {Array} emptyInputs - Array dari input configs yang kosong
 * @returns {boolean} True jika semua input terisi, false jika ada yang kosong
 */
function handleEmptyInputs(template, emptyInputs) {
  if (emptyInputs.length === 0) return true; // Semua terisi, lanjut copy

  // Expand card
  const card = document.querySelector(`[data-template-id="${template.id}"]`);
  const content = card?.querySelector('.card-content');
  if (content) {
    content.classList.add('expanded');
  }

  // Scroll dan focus ke input pertama yang kosong
  const firstEmptyInput = document.getElementById(emptyInputs[0].id);
  if (firstEmptyInput) {
    firstEmptyInput.focus();
    firstEmptyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Tampilkan warning via suara & focus (Pop-up dihapus agar tidak menumpuk)
  if (typeof SoundEffects !== 'undefined') {
    SoundEffects.playWarning();
  }

  return false; // Jangan copy
}
