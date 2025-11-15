// ============================================
// UI - DOM Creation and Manipulation
// ============================================

/**
 * Generate output text berdasarkan template
 * @param {Object} template - Template object
 * @param {number} copyIndex - Index dari copy variant
 * @returns {string} Generated output text
 */
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

/**
 * Get input values dari semua inputs dalam template
 * @param {Object} template - Template object
 * @returns {Object} Object dengan key=inputId, value=inputValue
 */
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

/**
 * Update card output preview saat input berubah
 * @param {Object} template - Template object
 */
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

/**
 * Buat elemen card dari template
 * @param {Object} template - Template object
 * @returns {HTMLElement} Card element
 */
function createCard(template) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-template-id', template.id);

  // ========== HEADER ==========
  const header = document.createElement('div');
  header.className = 'card-header';

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

  // ========== ACTION BUTTONS (COPY) ==========
  if (template.isMultiCopy && template.copies) {
    template.copies.forEach((copy, index) => {
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = copy.label;
      btn.setAttribute('data-copy-index', index);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
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
      e.stopPropagation();
      handleCopy(template, 0, btn);
    });
    actions.appendChild(btn);
  }

  header.appendChild(headerContent);
  header.appendChild(actions);

  // ========== CONTENT AREA (INPUTS & OUTPUT) ==========
  const content = document.createElement('div');
  content.className = 'card-content';

  // Jika template memiliki inputs
  if (template.hasInputs && template.inputs) {
    const inputsSection = document.createElement('div');
    inputsSection.className = 'card-inputs-section';

    template.inputs.forEach((inputConfig) => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';

      // Label container dengan clear button
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

      // Input element
      let inputElement;
      if (inputConfig.isSelect) {
        // Create select element
        inputElement = document.createElement('select');
        inputElement.innerHTML = '<option value="">-- Pilih salah satu --</option>';
        if (inputConfig.options) {
          inputConfig.options.forEach((option) => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            inputElement.appendChild(optionEl);
          });
        }
      } else if (inputConfig.isTextarea) {
        inputElement = document.createElement('textarea');
        inputElement.rows = 3;
      } else {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
      }

      inputElement.id = inputConfig.id;
      inputElement.className = 'input-field';
      if (!inputConfig.isSelect) {
        inputElement.placeholder = inputConfig.placeholder;
      }

      // Load dari cache jika tersimpan
      let cached = getInputValue(inputConfig.id);
      
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
          removeInputValue(inputConfig.id);
        }
        updateCardOutput(template);
        updateInputBorderColor(inputElement);
        inputElement.focus();
      });

      // Save ke cache saat berubah (jika cache enabled)
      inputElement.addEventListener('input', (e) => {
        if (inputConfig.cache) {
          saveInputValue(inputConfig.id, e.target.value);
        }
        updateCardOutput(template);
        updateInputBorderColor(inputElement);
      });

      // Handle change event untuk select element
      if (inputConfig.isSelect) {
        inputElement.addEventListener('change', (e) => {
          if (inputConfig.cache) {
            saveInputValue(inputConfig.id, e.target.value);
          }
          updateCardOutput(template);
          updateInputBorderColor(inputElement);
        });
      }

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
    if (e.target.closest('.copy-btn')) {
      return;
    }
    content.classList.toggle('expanded');
  });

  card.appendChild(header);
  card.appendChild(content);

  return card;
}
