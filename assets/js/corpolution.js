// ============================================
// CORPOLUTION - Corporate Text Automation
// ============================================

let userName = '';

// Helper functions
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
  },
  {
    id: 'tilawah',
    title: 'Tilawah',
    icon: '📖',
    isMultiCopy: true,
    copies: [
      {
        label: '🌅',
        template: (name) => `${name} Tilawah pagi ✅`
      },
      {
        label: '☀️',
        template: (name) => `${name} Tilawah siang ✅`
      },
      {
        label: '🌆',
        template: (name) => `${name} Tilawah sore ✅`
      }
    ]
  },
  {
    id: 'bacabuku',
    title: 'Baca Buku',
    icon: '📚',
    isMultiCopy: false,
    hasInputs: true,
    inputs: [
      { id: 'bacabuku_waktu', label: 'Rentang Waktu', placeholder: 'Contoh: 05.00-05.05', cache: true },
      { id: 'bacabuku_judul', label: 'Judul Buku', placeholder: 'Contoh: Seni Berpikir Positif', cache: true },
      { id: 'bacabuku_halaman', label: 'Halaman Buku', placeholder: 'Contoh: Hal. 115', cache: false },
      { id: 'bacabuku_paragraf', label: 'Isi Paragraf', placeholder: 'Masukkan isi paragraf...', cache: false, isTextarea: true }
    ],
    template: (name, inputs) => {
      const waktu = inputs.bacabuku_waktu || '';
      const judul = inputs.bacabuku_judul || '';
      const halaman = inputs.bacabuku_halaman || '';
      const paragraf = inputs.bacabuku_paragraf || '';
      
      return `*${name}*
${formatTodayIndonesia()}
${waktu}
*${judul}*
${halaman}

"${paragraf}"

*#tasnimgroup*
#buildinghappyliving
#readingculture`;
    }
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
  } else if (template.hasInputs) {
    // Copy button untuk template dengan inputs
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '📋';
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card expand/collapse
      const inputs = getInputValues(template);
      handleCopy(template, 0, btn, inputs);
    });
    actions.appendChild(btn);
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

  // Content area - awalnya tersembunyi
  const content = document.createElement('div');
  content.className = 'card-content';

  // Jika template memiliki inputs
  if (template.hasInputs && template.inputs) {
    const inputsSection = document.createElement('div');
    inputsSection.className = 'card-inputs-section';

    template.inputs.forEach((inputConfig) => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';

      const label = document.createElement('label');
      label.htmlFor = inputConfig.id;
      label.textContent = inputConfig.label;

      let inputElement;
      if (inputConfig.isTextarea) {
        inputElement = document.createElement('textarea');
        inputElement.rows = 3;
      } else {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
      }

      inputElement.id = inputConfig.id;
      inputElement.className = 'input-field';
      inputElement.placeholder = inputConfig.placeholder;

      // Load dari cache jika tersimpan
      const cached = localStorage.getItem(`corpolution_${inputConfig.id}`);
      if (cached) {
        inputElement.value = cached;
      }

      // Save ke cache saat berubah (jika cache enabled)
      inputElement.addEventListener('input', (e) => {
        if (inputConfig.cache) {
          localStorage.setItem(`corpolution_${inputConfig.id}`, e.target.value);
        }
        updateCardOutput(template);
      });

      inputGroup.appendChild(label);
      inputGroup.appendChild(inputElement);
      inputsSection.appendChild(inputGroup);
    });

    content.appendChild(inputsSection);

    // Add output preview untuk card dengan inputs
    const output = document.createElement('div');
    output.className = 'card-output';
    output.setAttribute('data-template-id', template.id);
    const inputs = getInputValues(template);
    output.textContent = template.template(userName, inputs);
    content.appendChild(output);
  }

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
    return `(Masukkan nama untuk melihat hasil)`;
  }

  if (template.isMultiCopy && template.copies[copyIndex]) {
    return template.copies[copyIndex].template(userName);
  } else if (!template.isMultiCopy && template.copies) {
    return template.copies[0].template(userName);
  }

  return '';
}

// Get input values untuk template dengan inputs
function getInputValues(template) {
  const inputs = {};
  if (template.inputs) {
    template.inputs.forEach((inputConfig) => {
      const element = document.getElementById(inputConfig.id);
      inputs[inputConfig.id] = element ? element.value : '';
    });
  }
  return inputs;
}

// Update card output saat input berubah
function updateCardOutput(template) {
  const card = document.querySelector(`[data-template-id="${template.id}"]`);
  if (card && template.hasInputs) {
    const output = card.querySelector('.card-output');
    if (output) {
      const inputs = getInputValues(template);
      output.textContent = template.template(userName, inputs);
    }
  }
}

// Handle copy ke clipboard
async function handleCopy(template, copyIndex, button, inputs = null) {
  let text;
  
  if (inputs) {
    text = template.template(userName, inputs);
  } else if (template.hasInputs) {
    const inputValues = getInputValues(template);
    text = template.template(userName, inputValues);
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

// Update semua cards ketika nama berubah
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
