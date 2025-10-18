
// DOM elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeGallery();
    initializePortfolioFilter();
    initializeContactForm();
    initializeSmoothScroll();
    initializeBackToTop();
});

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

// Gallery functions
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
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

// Portfolio filter
function initializePortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Terima kasih! Pesan Anda telah terkirim. Tim kami akan menghubungi Anda segera.');
            contactForm.reset();
        });
    }
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        if (link.getAttribute('href') !== '#') {
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
        }
    });
}



// Back to Top Button
const backToTop = document.getElementById('backToTop');
const heroSection = document.querySelector('.hero');

const checkHeroVisibility = () => {
    const heroRect = heroSection.getBoundingClientRect();
    const isHeroVisible = heroRect.bottom > 0;
    
    if (!isHeroVisible) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
};

window.addEventListener('scroll', checkHeroVisibility);
checkHeroVisibility(); // Check initial state

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
