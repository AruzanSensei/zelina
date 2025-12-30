// Main Application
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySidebarState();
        this.renderServices();
        cartManager.renderCart();
        cartManager.renderOrders();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Promo button navigation
        document.querySelectorAll('[data-page]').forEach(el => {
            if (!el.classList.contains('nav-link')) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = el.getAttribute('data-page');
                    this.navigateTo(page);
                });
            }
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Sidebar collapsed setting
        const sidebarCollapsedToggle = document.getElementById('sidebarCollapsedToggle');
        if (sidebarCollapsedToggle) {
            sidebarCollapsedToggle.checked = this.sidebarCollapsed;
            sidebarCollapsedToggle.addEventListener('change', (e) => {
                this.setSidebarCollapsed(e.target.checked);
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Checkout modal
        const modalBackdrop = document.getElementById('modalBackdrop');
        const cancelCheckout = document.getElementById('cancelCheckout');
        const confirmCheckout = document.getElementById('confirmCheckout');

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => this.closeCheckoutModal());
        }
        if (cancelCheckout) {
            cancelCheckout.addEventListener('click', () => this.closeCheckoutModal());
        }
        if (confirmCheckout) {
            confirmCheckout.addEventListener('click', () => this.confirmCheckout());
        }

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebarToggle');

            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    navigateTo(page) {
        // Update active page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(page).classList.add('active');

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }

        this.currentPage = page;

        // Render content for specific pages
        if (page === 'cart') {
            cartManager.renderCart();
        } else if (page === 'orders') {
            cartManager.renderOrders();
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');

        if (window.innerWidth <= 768) {
            // Mobile: toggle active class (show/hide)
            sidebar.classList.toggle('active');
        } else {
            // Desktop: toggle collapsed class
            sidebar.classList.toggle('collapsed');
            this.sidebarCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);

            // Update settings toggle
            const sidebarCollapsedToggle = document.getElementById('sidebarCollapsedToggle');
            if (sidebarCollapsedToggle) {
                sidebarCollapsedToggle.checked = this.sidebarCollapsed;
            }
        }
    }

    setSidebarCollapsed(collapsed) {
        const sidebar = document.getElementById('sidebar');
        this.sidebarCollapsed = collapsed;

        if (collapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }

        localStorage.setItem('sidebarCollapsed', collapsed);
    }

    applySidebarState() {
        if (this.sidebarCollapsed && window.innerWidth > 768) {
            document.getElementById('sidebar').classList.add('collapsed');
        }
    }

    renderServices() {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) return;

        const servicesHTML = SERVICES.map(service => `
      <div class="service-card" data-service-id="${service.id}">
        <div class="service-header">
          <span class="service-badge ${service.difficulty}">${service.difficultyText}</span>
          <h3 class="service-title">${service.name}</h3>
          <p class="service-description">${service.description}</p>
        </div>
        <div class="service-body">
          <div class="service-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Durasi: ${service.duration}</span>
            </div>
          </div>
          
          <div class="service-rating">
            <div class="stars">
              ${this.renderStars(service.rating)}
            </div>
            <span class="rating-text">${service.rating} (${service.reviews} reviews)</span>
          </div>
          
          <div class="service-footer">
            <div>
              <div class="service-price">
                Rp ${cartManager.formatPrice(service.price)}
              </div>
              <div class="price-label">per layanan</div>
            </div>
            <button class="btn btn-primary" onclick="cartManager.addToCart(${service.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');

        servicesGrid.innerHTML = servicesHTML;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star">★</span>';
        }

        if (hasHalfStar) {
            stars += '<span class="star">★</span>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star" style="opacity: 0.3">★</span>';
        }

        return stars;
    }

    handleSearch(query) {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) return;

        const cards = servicesGrid.querySelectorAll('.service-card');
        const searchTerm = query.toLowerCase();

        cards.forEach(card => {
            const serviceId = parseInt(card.getAttribute('data-service-id'));
            const service = SERVICES.find(s => s.id === serviceId);

            if (service) {
                const matchesSearch =
                    service.name.toLowerCase().includes(searchTerm) ||
                    service.description.toLowerCase().includes(searchTerm);

                card.style.display = matchesSearch ? 'block' : 'none';
            }
        });

        // Auto-navigate to services page if searching
        if (query && this.currentPage !== 'services') {
            this.navigateTo('services');
        }
    }

    openCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    confirmCheckout() {
        cartManager.checkout();
        this.closeCheckoutModal();
        this.navigateTo('orders');
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}
