// ============================================
// CORPOLUTION - Corporate Text Automation
// ============================================

let userName = '';

// Template konfigurasi - mudah untuk ditambah
const templates = [
  {
    id: 'login',
    title: 'Log in',
    icon: '📝',
    isMultiCopy: true,
    copies: [
      {
        label: '1',
        template: (name) => `${name} Log in ✅`
      },
      {
        label: '2',
        template: (name) => `${name} Log in 2✅`
      },
      {
        label: '3',
        template: (name) => `${name} Log in 3✅`
      }
    ]
  }
];

// Inisialisasi aplikasi
function init() {
  loadUserName();
  setupEventListeners();
  renderCards();
}

// Muat nama dari localStorage
function loadUserName() {
  const stored = localStorage.getItem('corpolution_userName');
  if (stored) {
    userName = stored;
    document.getElementById('fullName').value = userName;
  }
}

// Setup event listeners
function setupEventListeners() {
  const fullNameInput = document.getElementById('fullName');
  fullNameInput.addEventListener('input', (e) => {
    userName = e.target.value;
    localStorage.setItem('corpolution_userName', userName);
    updateAllCards();
  });
}

// Render semua cards
function renderCards() {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';

  templates.forEach((template) => {
    const cardElement = createCard(template);
    container.appendChild(cardElement);
  });
}

// Buat elemen card
function createCard(template) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-template-id', template.id);

  // Header card
  const header = document.createElement('div');
  header.className = 'card-header';

  // Bungkus icon dan title dalam div terpisah untuk expand/collapse
  const headerContent = document.createElement('div');
  headerContent.className = 'card-header-content';

  const icon = document.createElement('div');
  icon.className = 'card-icon';
  icon.textContent = template.icon;

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = template.title;

  headerContent.appendChild(icon);
  headerContent.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  // Jika multi copy (Log in punya 3 tombol)
  if (template.isMultiCopy && template.copies) {
    template.copies.forEach((copy, index) => {
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = copy.label;
      btn.setAttribute('data-copy-index', index);
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card expand/collapse
        handleCopy(template, index, btn);
      });
      actions.appendChild(btn);
    });
  } else {
    // Single copy button
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '📋';
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card expand/collapse
      handleCopy(template, 0, btn);
    });
    actions.appendChild(btn);
  }

  header.appendChild(headerContent);
  header.appendChild(actions);

  // Content area (preview) - awalnya tersembunyi
  const content = document.createElement('div');
  content.className = 'card-content';

  const output = document.createElement('div');
  output.className = 'card-output';
  output.setAttribute('data-template-id', template.id);
  output.textContent = generateOutput(template, 0);

  content.appendChild(output);

  // Event listener untuk expand/collapse saat header diklik
  header.addEventListener('click', (e) => {
    // Jangan expand jika yang diklik adalah button
    if (e.target.closest('.copy-btn')) {
      return;
    }
    content.classList.toggle('expanded');
  });

  card.appendChild(header);
  card.appendChild(content);

  return card;
}

// Generate output text berdasarkan template
function generateOutput(template, copyIndex = 0) {
  if (!userName) {
    return template.isMultiCopy
      ? `(Masukkan nama untuk melihat hasil)`
      : `(Masukkan nama untuk melihat hasil)`;
  }

  if (template.isMultiCopy && template.copies[copyIndex]) {
    return template.copies[copyIndex].template(userName);
  } else if (!template.isMultiCopy && template.copies) {
    return template.copies[0].template(userName);
  }

  return '';
}

// Handle copy ke clipboard
async function handleCopy(template, copyIndex, button) {
  const text = generateOutput(template, copyIndex);

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

// Update semua cards ketika nama berubah
function updateAllCards() {
  templates.forEach((template) => {
    const outputs = document.querySelectorAll(
      `[data-template-id="${template.id}"]`
    );
    outputs.forEach((output) => {
      output.textContent = generateOutput(template, 0);
    });
  });
}

// Jalankan aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', init);
