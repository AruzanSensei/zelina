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

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}

function getAutoTimeRange() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
  
  const startTime = formatTime(fiveMinutesAgo);
  const endTime = formatTime(now);
  
  return { startTime, endTime };
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
        template: (name) => `${name} Log IN ✅`
      },
      {
        label: '2',
        template: (name) => `${name} Log IN 2✅`
      },
      {
        label: '3',
        template: (name) => `${name} Log IN 3✅`
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
        template: (name) => `${name} Tilawah Pagi ✅`
      },
      {
        label: '☀️',
        template: (name) => `${name} Tilawah Siang ✅`
      },
      {
        label: '🌆',
        template: (name) => `${name} Tilawah Sore ✅`
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
      { id: 'bacabuku_waktu_mulai', label: 'Waktu Mulai', placeholder: 'Contoh: 05.00', cache: true },
      { id: 'bacabuku_waktu_selesai', label: 'Waktu Selesai', placeholder: 'Contoh: 05.05', cache: true },
      { id: 'bacabuku_judul', label: 'Judul Buku', placeholder: 'Contoh: Seni Berpikir Positif', cache: true },
      { id: 'bacabuku_halaman', label: 'Halaman Buku', placeholder: 'Contoh: 115', cache: true },
      { id: 'bacabuku_paragraf', label: 'Isi Paragraf', placeholder: 'Masukkan isi paragraf...', cache: true, isTextarea: true }
    ],
    template: (name, inputs) => {
      const waktuMulai = inputs.bacabuku_waktu_mulai || '';
      const waktuSelesai = inputs.bacabuku_waktu_selesai || '';
      const waktu = waktuMulai && waktuSelesai ? `${waktuMulai}-${waktuSelesai}` : '';
      const judul = inputs.bacabuku_judul || '';
      const halaman = inputs.bacabuku_halaman || '';
      const paragraf = inputs.bacabuku_paragraf || '';
      
      return `*${name}*
${formatTodayIndonesia()}
${waktu}
*${judul}*
Hal. ${halaman}

"${paragraf}"

*#tasnimgroup*
#buildinghappyliving
#readingculture`;
    }
  },
  {
    id: 'threegoals',
    title: '3 Goals & Result',
    icon: '🎯',
    isMultiCopy: true,
    hasInputs: true,
    copies: [
      {
        label: '🎯',
        template: (name, inputs) => {
          const goal1 = inputs.threegoals_goal1 || '';
          const goal2 = inputs.threegoals_goal2 || '';
          const goal3 = inputs.threegoals_goal3 || '';
          return `*3 Point Goals*
${name}

1. ${goal1}
2. ${goal2}
3. ${goal3}

#buildinghappyliving`;
        }
      },
      {
        label: '🥇',
        template: (name, inputs) => {
          const goal1 = inputs.threegoals_goal1 || '';
          const goal2 = inputs.threegoals_goal2 || '';
          const goal3 = inputs.threegoals_goal3 || '';
          return `*3 Point Results*
${name}

1. ${goal1} ✅
2. ${goal2} ✅
3. ${goal3} ✅

#buildinghappyliving`;
        }
      }
    ],
    inputs: [
      { id: 'threegoals_goal1', label: 'Goal/Result 1', placeholder: 'Masukkan goal pertama...', cache: true },
      { id: 'threegoals_goal2', label: 'Goal/Result 2', placeholder: 'Masukkan goal kedua...', cache: true },
      { id: 'threegoals_goal3', label: 'Goal/Result 3', placeholder: 'Masukkan goal ketiga...', cache: true }
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
  } else if (template.hasInputs) {
    // Copy button untuk template dengan inputs
    if (template.isMultiCopy && template.copies) {
      // Multi-copy untuk template dengan inputs
      template.copies.forEach((copy, index) => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = copy.label;
        btn.setAttribute('data-copy-index', index);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const inputs = getInputValues(template);
          handleCopy(template, index, btn, inputs);
        });
        actions.appendChild(btn);
      });
    } else {
      // Single copy untuk template dengan inputs
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '📋';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const inputs = getInputValues(template);
        handleCopy(template, 0, btn, inputs);
      });
      actions.appendChild(btn);
    }
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

      const labelContainer = document.createElement('div');
      labelContainer.className = 'input-label-container';

      const label = document.createElement('label');
      label.htmlFor = inputConfig.id;
      label.textContent = inputConfig.label;

      const clearBtn = document.createElement('button');
      clearBtn.className = 'input-clear-btn';
      clearBtn.textContent = '🗑️';
      clearBtn.setAttribute('type', 'button');
      clearBtn.setAttribute('title', `Hapus ${inputConfig.label}`);

      labelContainer.appendChild(label);
      labelContainer.appendChild(clearBtn);
      inputGroup.appendChild(labelContainer);

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
      let cached = localStorage.getItem(`corpolution_${inputConfig.id}`);
      
      // Auto-fill waktu untuk Baca Buku
      if (template.id === 'bacabuku' && !cached) {
        const timeRange = getAutoTimeRange();
        if (inputConfig.id === 'bacabuku_waktu_mulai') {
          inputElement.value = timeRange.startTime;
        } else if (inputConfig.id === 'bacabuku_waktu_selesai') {
          inputElement.value = timeRange.endTime;
        }
      } else if (cached) {
        inputElement.value = cached;
      }

      // Clear button functionality
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        inputElement.value = '';
        if (inputConfig.cache) {
          localStorage.removeItem(`corpolution_${inputConfig.id}`);
        }
        updateCardOutput(template);
        updateInputBorderColor(inputElement);
        inputElement.focus();
      });

      // Save ke cache saat berubah (jika cache enabled)
      inputElement.addEventListener('input', (e) => {
        if (inputConfig.cache) {
          localStorage.setItem(`corpolution_${inputConfig.id}`, e.target.value);
        }
        updateCardOutput(template);
        updateInputBorderColor(inputElement);
      });

      // Initial check border color
      updateInputBorderColor(inputElement);

      inputGroup.appendChild(inputElement);
      inputsSection.appendChild(inputGroup);
    });

    content.appendChild(inputsSection);

    // Add output preview untuk card dengan inputs
    const output = document.createElement('div');
    output.className = 'card-output';
    output.setAttribute('data-template-id', template.id);
    const inputs = getInputValues(template);
    
    if (template.isMultiCopy && template.copies) {
      // Untuk multi-copy, tampilkan copy pertama
      output.textContent = template.copies[0].template(userName, inputs);
    } else if (template.template) {
      output.textContent = template.template(userName, inputs);
    }
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

  if (template.hasInputs && template.isMultiCopy && template.copies) {
    // Untuk template dengan inputs dan multi-copy
    const inputs = getInputValues(template);
    return template.copies[copyIndex].template(userName, inputs);
  } else if (template.isMultiCopy && template.copies[copyIndex]) {
    // Untuk template multi-copy biasa
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

// Update border color berdasarkan apakah input terisi atau tidak
function updateInputBorderColor(inputElement) {
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

// Validasi input - return array dari input yang kosong
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

// Handle ketika ada input kosong saat copy
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

  // Tampilkan warning
  alert(`❌ Harap isi ${emptyInputs.map(input => `"${input.label}"`).join(', ')} terlebih dahulu`);
  
  return false; // Jangan copy
}

// Update card output saat input berubah
function updateCardOutput(template) {
  const card = document.querySelector(`[data-template-id="${template.id}"]`);
  if (card && template.hasInputs) {
    const output = card.querySelector('.card-output');
    if (output) {
      const inputs = getInputValues(template);
      if (template.isMultiCopy && template.copies) {
        // Untuk multi-copy, tampilkan copy pertama
        output.textContent = template.copies[0].template(userName, inputs);
      } else if (template.template) {
        output.textContent = template.template(userName, inputs);
      }
    }
  }
}

// Handle copy ke clipboard
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
