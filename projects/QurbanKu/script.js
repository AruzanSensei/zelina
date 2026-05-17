
// Language translations
const translations = {
    id: {
        // Navigation
        'brand': 'QurbanKu',
        'nav-home': 'Beranda',
        'nav-animals': 'Hewan Qurban',
        'nav-gallery': 'Galeri',
        'nav-contact': 'Kontak',

        // Home page
        'hero-title': 'Layanan Qurban Terpercaya',
        'hero-subtitle': 'Kami menyediakan hewan qurban berkualitas tinggi dengan pelayanan terbaik untuk ibadah Anda',
        'hero-cta': 'Pilih Hewan Qurban',
        'hero-learn': 'Pelajari Lebih Lanjut',

        'services-title': 'Layanan Kami',
        'services-subtitle': 'Melayani kebutuhan qurban Anda dengan penuh amanah',
        'service1-title': 'Sapi Premium',
        'service1-desc': 'Sapi pilihan dengan kualitas terbaik dan berat sesuai syariat',
        'service2-title': 'Kambing Berkualitas',
        'service2-desc': 'Kambing sehat dan gemuk untuk kebutuhan qurban Anda',
        'service3-title': 'Antar ke Rumah',
        'service3-desc': 'Layanan antar langsung ke alamat Anda',
        'service4-title': 'Dokumentasi',
        'service4-desc': 'Dokumentasi lengkap proses penyembelihan',

        'about-title': 'Mengapa Memilih Kami?',
        'about-desc': 'Dengan pengalaman puluhan tahun dalam melayani ibadah qurban, kami berkomitmen memberikan yang terbaik untuk umat. Setiap hewan yang kami sediakan telah melewati seleksi ketat dan pemeriksaan kesehatan.',
        'feature1': 'Hewan berkualitas dan sehat',
        'feature2': 'Harga transparan',
        'feature3': 'Pelayanan 24/7',
        'feature4': 'Garansi kepuasan',

        // Animals page
        'animals-title': 'Pilih Hewan Qurban',
        'animals-subtitle': 'Hewan berkualitas tinggi untuk ibadah qurban Anda',
        'filter-all': 'Semua',
        'filter-cow': 'Sapi',
        'filter-goat': 'Kambing',
        'weight-label': 'Berat:',
        'type-label': 'Jenis:',
        'order-btn': 'Pesan Sekarang',
        'badge-premium': 'Premium',
        'badge-popular': 'Populer',

        // Animal names
        'cow1-name': 'Sapi Limosin Premium',
        'cow1-type': 'Sapi',
        'cow2-name': 'Sapi Brahman',
        'cow2-type': 'Sapi',
        'cow3-name': 'Sapi Simental',
        'cow3-type': 'Sapi',
        'goat1-name': 'Kambing Etawa',
        'goat1-type': 'Kambing',
        'goat2-name': 'Kambing Gibas',
        'goat2-type': 'Kambing',
        'goat3-name': 'Kambing Lokal',
        'goat3-type': 'Kambing',

        // Payment page
        'payment-title': 'Pembayaran',
        'payment-subtitle': 'Lengkapi pesanan dan pembayaran Anda',
        'order-info-title': 'Informasi Pesanan',
        'full-name-label': 'Nama Lengkap *',
        'phone-label': 'Nomor Telepon *',
        'email-label': 'Email',
        'address-label': 'Alamat Lengkap *',
        'delivery-date-label': 'Tanggal Pengiriman *',
        'notes-label': 'Catatan Khusus',
        'payment-method-title': 'Metode Pembayaran',
        'bank-transfer-label': 'Transfer Bank',
        'bank-transfer-desc': 'Transfer ke rekening bank kami',
        'e-wallet-label': 'E-Wallet',
        'e-wallet-desc': 'Bayar dengan GoPay, OVO, DANA',
        'bank-account-title': 'Detail Rekening Bank',
        'account-number': 'No. Rekening: 1234567890',
        'account-name': 'Atas Nama: QurbanKu Indonesia',
        'ewallet-qr-title': 'Scan QR Code',
        'qr-instruction': 'QR Code akan ditampilkan setelah konfirmasi pesanan',
        'confirm-order-btn': 'Konfirmasi Pesanan',
        'order-summary-title': 'Ringkasan Pesanan',
        'default-animal': 'Pilih Hewan Qurban',
        'subtotal-label': 'Subtotal:',
        'delivery-fee-label': 'Biaya Pengiriman:',
        'total-label': 'Total:',
        'guarantee-title': 'Garansi Kepuasan',
        'guarantee1': '✓ Hewan berkualitas terjamin',
        'guarantee2': '✓ Pengiriman tepat waktu',
        'guarantee3': '✓ Dokumentasi lengkap',
        'guarantee4': '✓ Layanan 24/7',

        // Gallery page
        'gallery-title': 'Galeri Dokumentasi',
        'gallery-subtitle': 'Dokumentasi pelaksanaan qurban kami',
        'gallery1-title': 'Sapi Premium Quality',
        'gallery1-desc': 'Sapi berkualitas tinggi siap untuk qurban',
        'gallery2-title': 'Proses Pemeriksaan',
        'gallery2-desc': 'Pemeriksaan kesehatan hewan secara menyeluruh',
        'gallery3-title': 'Kambing Berkualitas',
        'gallery3-desc': 'Kambing sehat dan gemuk untuk qurban',
        'gallery4-title': 'Area Peternakan',
        'gallery4-desc': 'Lingkungan bersih dan nyaman untuk hewan',
        'gallery5-title': 'Perawatan Hewan',
        'gallery5-desc': 'Perawatan terbaik untuk kesehatan hewan',
        'gallery6-title': 'Transportasi',
        'gallery6-desc': 'Transportasi aman untuk pengiriman hewan',
        'gallery7-title': 'Tim Profesional',
        'gallery7-desc': 'Tim berpengalaman dalam menangani hewan qurban',
        'gallery8-title': 'Proses Penyembelihan',
        'gallery8-desc': 'Penyembelihan sesuai syariat Islam',
        'gallery9-title': 'Pembagian Daging',
        'gallery9-desc': 'Pembagian daging yang adil dan higienis',

        // Contact page
        'contact-title': 'Hubungi Kami',
        'contact-subtitle': 'Siap melayani kebutuhan qurban Anda 24/7',
        'contact-info-title': 'Informasi Kontak',
        'address-title': 'Alamat',
        'address-text': 'Jl. Raya Qurban No. 123<br>Jakarta Selatan, 12345<br>Indonesia',
        'phone-title': 'Telepon',
        'email-title': 'Email',
        'hours-title': 'Jam Operasional',
        'hours-text': 'Senin - Jumat: 08:00 - 17:00<br>Sabtu - Minggu: 08:00 - 15:00',
        'social-title': 'Media Sosial',
        'contact-form-title': 'Kirim Pesan',
        'first-name-label': 'Nama Depan *',
        'last-name-label': 'Nama Belakang *',
        'subject-label': 'Subjek *',
        'select-subject': 'Pilih subjek',
        'subject-inquiry': 'Pertanyaan Umum',
        'subject-order': 'Pemesanan',
        'subject-complaint': 'Keluhan',
        'subject-suggestion': 'Saran',
        'message-label': 'Pesan *',
        'send-message-btn': 'Kirim Pesan',
        'location-title': 'Lokasi Kami',

        // Footer
        'footer-desc': 'Melayani kebutuhan qurban umat dengan penuh amanah dan profesional.',
        'footer-links': 'Tautan',
        'footer-contact': 'Kontak',
        'footer-rights': 'Semua hak dilindungi.'
    },
    en: {
        // Navigation
        'brand': 'QurbanKu',
        'nav-home': 'Home',
        'nav-animals': 'Qurban Animals',
        'nav-gallery': 'Gallery',
        'nav-contact': 'Contact',

        // Home page
        'hero-title': 'Trusted Qurban Service',
        'hero-subtitle': 'We provide high-quality qurban animals with the best service for your worship',
        'hero-cta': 'Choose Qurban Animal',
        'hero-learn': 'Learn More',

        'services-title': 'Our Services',
        'services-subtitle': 'Serving your qurban needs with full trust',
        'service1-title': 'Premium Cattle',
        'service1-desc': 'Selected cattle with the best quality and weight according to Islamic law',
        'service2-title': 'Quality Goats',
        'service2-desc': 'Healthy and fat goats for your qurban needs',
        'service3-title': 'Home Delivery',
        'service3-desc': 'Direct delivery service to your address',
        'service4-title': 'Documentation',
        'service4-desc': 'Complete documentation of the slaughtering process',

        'about-title': 'Why Choose Us?',
        'about-desc': 'With decades of experience in serving qurban worship, we are committed to providing the best for the ummah. Every animal we provide has passed strict selection and health examination.',
        'feature1': 'Quality and healthy animals',
        'feature2': 'Transparent pricing',
        'feature3': '24/7 service',
        'feature4': 'Satisfaction guarantee',

        // Animals page
        'animals-title': 'Choose Qurban Animals',
        'animals-subtitle': 'High-quality animals for your qurban worship',
        'filter-all': 'All',
        'filter-cow': 'Cattle',
        'filter-goat': 'Goats',
        'weight-label': 'Weight:',
        'type-label': 'Type:',
        'order-btn': 'Order Now',
        'badge-premium': 'Premium',
        'badge-popular': 'Popular',

        // Animal names
        'cow1-name': 'Premium Limousin Cattle',
        'cow1-type': 'Cattle',
        'cow2-name': 'Brahman Cattle',
        'cow2-type': 'Cattle',
        'cow3-name': 'Simmental Cattle',
        'cow3-type': 'Cattle',
        'goat1-name': 'Etawa Goat',
        'goat1-type': 'Goat',
        'goat2-name': 'Gibas Goat',
        'goat2-type': 'Goat',
        'goat3-name': 'Local Goat',
        'goat3-type': 'Goat',

        // Payment page
        'payment-title': 'Payment',
        'payment-subtitle': 'Complete your order and payment',
        'order-info-title': 'Order Information',
        'full-name-label': 'Full Name *',
        'phone-label': 'Phone Number *',
        'email-label': 'Email',
        'address-label': 'Full Address *',
        'delivery-date-label': 'Delivery Date *',
        'notes-label': 'Special Notes',
        'payment-method-title': 'Payment Method',
        'bank-transfer-label': 'Bank Transfer',
        'bank-transfer-desc': 'Transfer to our bank account',
        'e-wallet-label': 'E-Wallet',
        'e-wallet-desc': 'Pay with GoPay, OVO, DANA',
        'bank-account-title': 'Bank Account Details',
        'account-number': 'Account Number: 1234567890',
        'account-name': 'Account Name: QurbanKu Indonesia',
        'ewallet-qr-title': 'Scan QR Code',
        'qr-instruction': 'QR Code will be displayed after order confirmation',
        'confirm-order-btn': 'Confirm Order',
        'order-summary-title': 'Order Summary',
        'default-animal': 'Choose Qurban Animal',
        'subtotal-label': 'Subtotal:',
        'delivery-fee-label': 'Delivery Fee:',
        'total-label': 'Total:',
        'guarantee-title': 'Satisfaction Guarantee',
        'guarantee1': '✓ Guaranteed quality animals',
        'guarantee2': '✓ On-time delivery',
        'guarantee3': '✓ Complete documentation',
        'guarantee4': '✓ 24/7 service',

        // Gallery page
        'gallery-title': 'Documentation Gallery',
        'gallery-subtitle': 'Our qurban implementation documentation',
        'gallery1-title': 'Premium Quality Cattle',
        'gallery1-desc': 'High-quality cattle ready for qurban',
        'gallery2-title': 'Inspection Process',
        'gallery2-desc': 'Comprehensive animal health examination',
        'gallery3-title': 'Quality Goats',
        'gallery3-desc': 'Healthy and fat goats for qurban',
        'gallery4-title': 'Farm Area',
        'gallery4-desc': 'Clean and comfortable environment for animals',
        'gallery5-title': 'Animal Care',
        'gallery5-desc': 'Best care for animal health',
        'gallery6-title': 'Transportation',
        'gallery6-desc': 'Safe transportation for animal delivery',
        'gallery7-title': 'Professional Team',
        'gallery7-desc': 'Experienced team in handling qurban animals',
        'gallery8-title': 'Slaughtering Process',
        'gallery8-desc': 'Slaughtering according to Islamic law',
        'gallery9-title': 'Meat Distribution',
        'gallery9-desc': 'Fair and hygienic meat distribution',

        // Contact page
        'contact-title': 'Contact Us',
        'contact-subtitle': 'Ready to serve your qurban needs 24/7',
        'contact-info-title': 'Contact Information',
        'address-title': 'Address',
        'address-text': 'Jl. Raya Qurban No. 123<br>South Jakarta, 12345<br>Indonesia',
        'phone-title': 'Phone',
        'email-title': 'Email',
        'hours-title': 'Operating Hours',
        'hours-text': 'Monday - Friday: 08:00 - 17:00<br>Saturday - Sunday: 08:00 - 15:00',
        'social-title': 'Social Media',
        'contact-form-title': 'Send Message',
        'first-name-label': 'First Name *',
        'last-name-label': 'Last Name *',
        'subject-label': 'Subject *',
        'select-subject': 'Select subject',
        'subject-inquiry': 'General Inquiry',
        'subject-order': 'Order',
        'subject-complaint': 'Complaint',
        'subject-suggestion': 'Suggestion',
        'message-label': 'Message *',
        'send-message-btn': 'Send Message',
        'location-title': 'Our Location',

        // Footer
        'footer-desc': 'Serving the qurban needs of the ummah with full trust and professionalism.',
        'footer-links': 'Links',
        'footer-contact': 'Contact',
        'footer-rights': 'All rights reserved.'
    }
};

// Current language
let currentLang = 'id';

// DOM elements
const langToggle = document.getElementById('lang-toggle');
const currentFlag = document.getElementById('current-flag');
const currentLangSpan = document.getElementById('current-lang');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeNavigation();
    initializeAnimations();
    initializePageSpecific();
});

// Language functions
function initializeLanguage() {
    // Load saved language or default to Indonesian
    const savedLang = localStorage.getItem('language') || 'id';
    switchLanguage(savedLang);
    
    // Language toggle event listener
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            const newLang = currentLang === 'id' ? 'en' : 'id';
            switchLanguage(newLang);
        });
    }
}

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update flag and language display
    if (currentFlag && currentLangSpan) {
        currentFlag.textContent = lang === 'id' ? '🇮🇩' : '🇺🇸';
        currentLangSpan.textContent = lang.toUpperCase();
    }
    
    // Update all text elements
    updatePageText(lang);
    
    // Update document language
    document.documentElement.lang = lang;
}

function updatePageText(lang) {
    const elements = document.querySelectorAll('[data-id]');
    elements.forEach(element => {
        const key = element.getAttribute('data-id');
        if (translations[lang] && translations[lang][key]) {
            // Handle innerHTML for elements that contain HTML
            if (key.includes('address-text') || key.includes('hours-text')) {
                element.innerHTML = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}

// Navigation functions
function initializeNavigation() {
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // Sticky navbar
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'var(--white)';
                navbar.style.backdropFilter = 'none';
            }
        }
    });
}

// Animation functions
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .animal-card, .gallery-item');
    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

// Page-specific functions
function initializePageSpecific() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'animals':
            initializeAnimalsPage();
            break;
        case 'payment':
            initializePaymentPage();
            break;
        case 'gallery':
            initializeGalleryPage();
            break;
        case 'contact':
            initializeContactPage();
            break;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '') || 'index';
}

// Home page functions
function initializeHomePage() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Hero animation on load
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    }, 500);
}

// Animals page functions
function initializeAnimalsPage() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const animalCards = document.querySelectorAll('.animal-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            animalCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Order button functionality
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const animalName = this.getAttribute('data-animal');
            const animalPrice = this.getAttribute('data-price');
            
            // Store order data
            localStorage.setItem('selectedAnimal', JSON.stringify({
                name: animalName,
                price: animalPrice
            }));
            
            // Redirect to payment page
            window.location.href = 'payment.html';
        });
    });
}

// Payment page functions
function initializePaymentPage() {
    // Load selected animal data
    const selectedAnimal = JSON.parse(localStorage.getItem('selectedAnimal') || '{}');
    if (selectedAnimal.name) {
        updateOrderSummary(selectedAnimal);
    }
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const bankDetails = document.getElementById('bank-details');
    const ewalletDetails = document.getElementById('ewallet-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'bank-transfer') {
                bankDetails.classList.add('active');
                ewalletDetails.classList.remove('active');
            } else {
                bankDetails.classList.remove('active');
                ewalletDetails.classList.add('active');
            }
        });
    });
    
    // Form validation and submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validatePaymentForm()) {
                submitPaymentForm();
            }
        });
    }
    
    // Set minimum delivery date (tomorrow)
    const deliveryDate = document.getElementById('deliveryDate');
    if (deliveryDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deliveryDate.min = tomorrow.toISOString().split('T')[0];
    }
}

function updateOrderSummary(animal) {
    const animalNameEl = document.getElementById('animal-name');
    const animalTypeEl = document.getElementById('animal-type');
    const animalPriceEl = document.getElementById('animal-price');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (animalNameEl) animalNameEl.textContent = animal.name;
    if (animalTypeEl) {
        animalTypeEl.textContent = animal.name.toLowerCase().includes('sapi') ? 
            (currentLang === 'id' ? 'Sapi' : 'Cattle') : 
            (currentLang === 'id' ? 'Kambing' : 'Goat');
    }
    
    const price = parseInt(animal.price);
    const deliveryFee = 500000;
    const total = price + deliveryFee;
    
    if (animalPriceEl) animalPriceEl.textContent = formatCurrency(price);
    if (subtotalEl) subtotalEl.textContent = formatCurrency(price);
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function validatePaymentForm() {
    const requiredFields = ['fullName', 'phone', 'address', 'deliveryDate'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(fieldId + '-error');
        
        if (field && !field.value.trim()) {
            field.classList.add('error');
            if (errorEl) {
                errorEl.textContent = currentLang === 'id' ? 'Field ini wajib diisi' : 'This field is required';
            }
            isValid = false;
        } else if (field) {
            field.classList.remove('error');
            if (errorEl) {
                errorEl.textContent = '';
            }
        }
    });
    
    // Phone validation
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value) {
        const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
        if (!phoneRegex.test(phoneField.value.replace(/\s/g, ''))) {
            phoneField.classList.add('error');
            const errorEl = document.getElementById('phone-error');
            if (errorEl) {
                errorEl.textContent = currentLang === 'id' ? 'Format nomor telepon tidak valid' : 'Invalid phone number format';
            }
            isValid = false;
        }
    }
    
    // Email validation (if provided)
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.classList.add('error');
            const errorEl = document.getElementById('email-error');
            if (errorEl) {
                errorEl.textContent = currentLang === 'id' ? 'Format email tidak valid' : 'Invalid email format';
            }
            isValid = false;
        }
    }
    
    return isValid;
}

function submitPaymentForm() {
    const submitBtn = document.querySelector('#payment-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'id' ? 'Memproses...' : 'Processing...';
    submitBtn.classList.add('loading');
    
    // Simulate form submission
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        
        // Show success message
        alert(currentLang === 'id' ? 
            'Pesanan berhasil dikonfirmasi! Kami akan menghubungi Anda segera.' : 
            'Order confirmed successfully! We will contact you soon.'
        );
        
        // Clear form
        document.getElementById('payment-form').reset();
        localStorage.removeItem('selectedAnimal');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 2000);
}

// Gallery page functions
function initializeGalleryPage() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    let currentImageIndex = 0;
    const images = Array.from(galleryItems).map(item => item.getAttribute('data-image'));
    
    // Open lightbox
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentImageIndex = index;
            openLightbox(this.getAttribute('data-image'));
        });
    });
    
    // Close lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            lightboxImage.src = images[currentImageIndex];
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            lightboxImage.src = images[currentImageIndex];
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                nextBtn.click();
            }
        }
    });
    
    function openLightbox(imageSrc) {
        if (lightbox && lightboxImage) {
            lightboxImage.src = imageSrc;
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Contact page functions
function initializeContactPage() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateContactForm()) {
                submitContactForm();
            }
        });
    }
    
    // Phone number formatting
    const phoneField = document.getElementById('contactPhone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.startsWith('0')) {
                value = '62' + value.substring(1);
            }
            if (!value.startsWith('62')) {
                value = '62' + value;
            }
            
            // Format as +62 XXX-XXXX-XXXX
            if (value.length >= 3) {
                value = '+' + value.substring(0, 2) + ' ' + value.substring(2);
            }
            if (value.length >= 8) {
                value = value.substring(0, 7) + '-' + value.substring(7);
            }
            if (value.length >= 13) {
                value = value.substring(0, 12) + '-' + value.substring(12, 16);
            }
            
            this.value = value;
        });
    }
}

function validateContactForm() {
    const requiredFields = ['firstName', 'lastName', 'contactEmail', 'contactPhone', 'subject', 'message'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.classList.add('error');
            showFieldError(fieldId, currentLang === 'id' ? 'Field ini wajib diisi' : 'This field is required');
            isValid = false;
        } else if (field) {
            field.classList.remove('error');
            hideFieldError(fieldId);
        }
    });
    
    // Email validation
    const emailField = document.getElementById('contactEmail');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.classList.add('error');
            showFieldError('contactEmail', currentLang === 'id' ? 'Format email tidak valid' : 'Invalid email format');
            isValid = false;
        }
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    let errorEl = document.getElementById(fieldId + '-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = fieldId + '-error';
        errorEl.className = 'error-message';
        const field = document.getElementById(fieldId);
        if (field && field.parentNode) {
            field.parentNode.appendChild(errorEl);
        }
    }
    errorEl.textContent = message;
}

function hideFieldError(fieldId) {
    const errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) {
        errorEl.textContent = '';
    }
}

function submitContactForm() {
    const submitBtn = document.querySelector('#contact-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'id' ? 'Mengirim...' : 'Sending...';
    submitBtn.classList.add('loading');
    
    // Simulate form submission
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        
        // Show success message
        alert(currentLang === 'id' ? 
            'Pesan berhasil dikirim! Kami akan merespon dalam 24 jam.' : 
            'Message sent successfully! We will respond within 24 hours.'
        );
        
        // Clear form
        document.getElementById('contact-form').reset();
    }, 2000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Handle offline/online status
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
});

// Performance optimization
document.addEventListener('DOMContentLoaded', function() {
    // Preload critical images
    const criticalImages = [
        'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src + '?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    });
});
