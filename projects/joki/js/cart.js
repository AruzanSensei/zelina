// Services Data
const SERVICES = [
    {
        id: 1,
        name: 'Joki Harian',
        description: 'Layanan joki mancing harian untuk menyelesaikan quest dan misi sehari-hari dengan cepat dan efisien.',
        duration: '1-3 Jam',
        difficulty: 'easy',
        difficultyText: 'Mudah',
        price: 50000,
        rating: 4.8,
        reviews: 124
    },
    {
        id: 2,
        name: 'Joki Ranking',
        description: 'Tingkatkan ranking mancing Anda dengan bantuan profesional kami. Dijamin naik tier!',
        duration: '1-2 Hari',
        difficulty: 'medium',
        difficultyText: 'Sedang',
        price: 150000,
        rating: 4.9,
        reviews: 89
    },
    {
        id: 3,
        name: 'Joki Event',
        description: 'Selesaikan event mancing spesial dan dapatkan reward eksklusif tanpa repot.',
        duration: '3-5 Jam',
        difficulty: 'medium',
        difficultyText: 'Sedang',
        price: 100000,
        rating: 4.7,
        reviews: 156
    },
    {
        id: 4,
        name: 'Joki Target Ikan Langka',
        description: 'Dapatkan ikan langka impian Anda dengan tingkat keberhasilan 95%. Garansi uang kembali!',
        duration: '2-4 Hari',
        difficulty: 'hard',
        difficultyText: 'Sulit',
        price: 300000,
        rating: 5.0,
        reviews: 67
    },
    {
        id: 5,
        name: 'Joki Tournament',
        description: 'Ikuti tournament mancing dan raih juara dengan bantuan pemain profesional kami.',
        duration: '1 Minggu',
        difficulty: 'hard',
        difficultyText: 'Sulit',
        price: 500000,
        rating: 4.9,
        reviews: 43
    }
];

// Cart Management
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.orders = this.loadOrders();
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    loadOrders() {
        const saved = localStorage.getItem('orders');
        return saved ? JSON.parse(saved) : [];
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    addToCart(serviceId, quantity = 1) {
        const service = SERVICES.find(s => s.id === serviceId);
        if (!service) return;

        const existingItem = this.cart.find(item => item.id === serviceId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...service,
                quantity
            });
        }

        this.saveCart();
        this.renderCart();
        this.showNotification('Berhasil ditambahkan ke cart!');
    }

    removeFromCart(serviceId) {
        this.cart = this.cart.filter(item => item.id !== serviceId);
        this.saveCart();
        this.renderCart();
    }

    updateQuantity(serviceId, quantity) {
        const item = this.cart.find(item => item.id === serviceId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.renderCart();
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Cart kosong!', 'error');
            return;
        }

        const order = {
            id: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            items: [...this.cart],
            total: this.getTotal(),
            status: 'progress'
        };

        this.orders.unshift(order);
        this.saveOrders();

        this.cart = [];
        this.saveCart();

        this.renderCart();
        this.renderOrders();

        this.showNotification('Order berhasil! Cek riwayat order Anda.', 'success');
    }

    renderCart() {
        const cartContent = document.getElementById('cartContent');
        if (!cartContent) return;

        if (this.cart.length === 0) {
            cartContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3 class="empty-title">Cart Anda Kosong</h3>
          <p class="empty-text">Belum ada layanan yang ditambahkan ke cart</p>
          <button class="btn btn-primary" onclick="app.navigateTo('services')">
            Lihat Layanan
          </button>
        </div>
      `;
            return;
        }

        const cartHTML = `
      <div class="cart-table">
        <table>
          <thead>
            <tr>
              <th>Layanan</th>
              <th>Harga</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${this.cart.map(item => `
              <tr>
                <td>
                  <div class="cart-item-info">
                    <div>
                      <div class="cart-item-name">${item.name}</div>
                      <div class="cart-item-desc">${item.duration}</div>
                    </div>
                  </div>
                </td>
                <td>Rp ${this.formatPrice(item.price)}</td>
                <td>
                  <div class="quantity-control">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </td>
                <td>Rp ${this.formatPrice(item.price * item.quantity)}</td>
                <td>
                  <button class="btn btn-danger" onclick="cartManager.removeFromCart(${item.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="cart-summary">
        <h3 class="summary-title">Ringkasan Belanja</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>Rp ${this.formatPrice(this.getTotal())}</span>
        </div>
        <div class="summary-row">
          <span>Biaya Admin</span>
          <span>Rp 0</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>Rp ${this.formatPrice(this.getTotal())}</span>
        </div>
        <button class="btn btn-primary checkout-btn" onclick="app.openCheckoutModal()">
          Checkout Sekarang
        </button>
      </div>
    `;

        cartContent.innerHTML = cartHTML;
    }

    renderOrders() {
        const orderList = document.getElementById('orderList');
        if (!orderList) return;

        if (this.orders.length === 0) {
            orderList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3 class="empty-title">Belum Ada Order</h3>
          <p class="empty-text">Riwayat order Anda akan muncul di sini</p>
          <button class="btn btn-primary" onclick="app.navigateTo('services')">
            Mulai Order
          </button>
        </div>
      `;
            return;
        }

        const ordersHTML = this.orders.map(order => {
            const date = new Date(order.date);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-id">Order ID: ${order.id}</div>
              <div class="order-date">${formattedDate}</div>
            </div>
            <span class="order-status ${order.status}">
              ${order.status === 'completed' ? 'Selesai' : 'Dalam Proses'}
            </span>
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                ${item.name} (x${item.quantity}) - Rp ${this.formatPrice(item.price * item.quantity)}
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            Total: Rp ${this.formatPrice(order.total)}
          </div>
        </div>
      `;
        }).join('');

        orderList.innerHTML = ordersHTML;
    }

    formatPrice(price) {
        return price.toLocaleString('id-ID');
    }

    showNotification(message, type = 'success') {
        // Simple notification - could be enhanced with a toast library
        alert(message);
    }
}

// Initialize cart manager
window.cartManager = new CartManager();
