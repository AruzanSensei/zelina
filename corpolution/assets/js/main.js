// ============================================
// MAIN - Initialization and Event Handling
// ============================================

// Global variable untuk menyimpan nama pengguna
let userName = '';

/**
 * Inisialisasi aplikasi
 */
function init() {
  loadUserNameFromStorage();
  setupEventListeners();
  renderCards();
}

/**
 * Muat nama dari localStorage dan set ke global variable
 */
function loadUserNameFromStorage() {
  const stored = loadUserName();
  if (stored) {
    userName = stored;
    document.getElementById('fullName').value = userName;
  }
}

/**
 * Setup event listeners untuk input nama
 */
function setupEventListeners() {
  const fullNameInput = document.getElementById('fullName');
  fullNameInput.addEventListener('input', (e) => {
    userName = e.target.value;
    saveUserName(userName);
    updateAllCards();
  });
}

/**
 * Render semua cards ke DOM
 */
function renderCards() {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';

  templates.forEach((template) => {
    const cardElement = createCard(template);
    container.appendChild(cardElement);
  });
}

/**
 * Handle copy ke clipboard
 * @param {Object} template - Template object
 * @param {number} copyIndex - Index dari copy variant
 * @param {HTMLElement} button - Button element yang diklik
 * @param {Object} inputs - Input values (optional)
 */
async function handleCopy(template, copyIndex, button, inputs = null) {
  // Validasi input jika template memiliki inputs
  if (template.hasInputs) {
    const emptyInputs = validateInputs(template);
    if (!handleEmptyInputs(template, emptyInputs)) {
      return; // Jangan copy jika ada input kosong
    }
  }

  let text;
  
  if (template.hasInputs) {
    const inputValues = inputs || getInputValues(template);
    if (template.isMultiCopy && template.copies[copyIndex]) {
      text = template.copies[copyIndex].template(userName, inputValues);
    } else if (template.copies) {
      text = template.copies[0].template(userName, inputValues);
    }
  } else if (template.isMultiCopy && template.copies[copyIndex]) {
    text = template.copies[copyIndex].template(userName);
  } else {
    text = generateOutput(template, copyIndex);
  }

  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    const originalText = button.textContent;
    button.textContent = '✓';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 1500);
  } catch (err) {
    console.error('Gagal menyalin ke clipboard:', err);
    button.textContent = '❌';
    setTimeout(() => {
      button.textContent = '📋';
    }, 1500);
  }
}

/**
 * Update semua cards ketika nama pengguna berubah
 */
function updateAllCards() {
  templates.forEach((template) => {
    const card = document.querySelector(`[data-template-id="${template.id}"]`);
    if (card) {
      const output = card.querySelector('.card-output');
      if (output) {
        if (template.hasInputs) {
          const inputs = getInputValues(template);
          output.textContent = template.template(userName, inputs);
        } else {
          output.textContent = generateOutput(template, 0);
        }
      }
    }
  });
}

// Jalankan aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', init);
