document.addEventListener('DOMContentLoaded', () => {
    const contactsTableBody = document.getElementById('contactsTableBody');
    const searchInput = document.getElementById('searchInput');
    const sortableHeaders = document.querySelectorAll('.sortable');
    const themeToggle = document.getElementById('themeToggle');
    let contacts = [];
    let currentSort = {
        column: null,
        direction: 'asc'
    };

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', newTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    // Load contacts from JSON file
    fetch('contacts.json')
        .then(response => response.json())
        .then(data => {
            contacts = data.contacts;
            displayContacts(contacts);
        })
        .catch(error => console.error('Error loading contacts:', error));

    // Normalize phone number to format 62XXXXXXXXXX
    function normalizePhone(number) {
        let cleaned = number.replace(/\D/g, ''); // Hapus semua non-digit
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
        } else if (cleaned.startsWith('62')) {
            // do nothing
        } else if (cleaned.startsWith('8')) {
            cleaned = '62' + cleaned;
        }
        return cleaned;
    }

    // Display contacts in table
    function displayContacts(contactsToShow) {
        contactsTableBody.innerHTML = '';
        contactsToShow.forEach(contact => {
            const normalizedNumber = normalizePhone(contact.number);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.name}</td>
                <td>
                    <a href="https://wa.me/${normalizedNumber}" class="phone-number" target="_blank">
                        ${normalizedNumber}
                    </a>
                </td>
                <td class="category-column"><span class="category-badge category-${contact.category.toLowerCase()}">${contact.category}</span></td>
                <td class="action-column">
                    <a href="https://wa.me/${normalizedNumber}" class="whatsapp-btn" target="_blank" title="Kirim Pesan WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </td>
            `;
            contactsTableBody.appendChild(row);
        });
    }

    // Sort functionality
    function sortContacts(column) {
        // Reset all sort headers
        sortableHeaders.forEach(header => {
            header.classList.remove('asc', 'desc');
        });

        // If clicking the same column, toggle direction
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }

        // Add sort class to current header
        const currentHeader = document.querySelector(`[data-sort="${column}"]`);
        currentHeader.classList.add(currentSort.direction);

        // Sort contacts
        contacts.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            if (column === 'number') {
                valueA = normalizePhone(valueA);
                valueB = normalizePhone(valueB);
            }

            if (valueA < valueB) {
                return currentSort.direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return currentSort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        displayContacts(contacts);
    }

    // Add click event to sortable headers
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            sortContacts(column);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredContacts = contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm) ||
            normalizePhone(contact.number).includes(searchTerm) ||
            contact.category.toLowerCase().includes(searchTerm)
        );
        displayContacts(filteredContacts);
    });
});
