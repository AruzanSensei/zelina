document.addEventListener('DOMContentLoaded', function () {
    // Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    const heroTexts = document.querySelectorAll('.hero-text');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    const totalSlides = slides.length;
    const interval = 5000;

    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach(slide => {
                slide.classList.remove('active');
                slide.style.opacity = '0';
            });
            heroTexts.forEach(text => {
                text.classList.remove('active');
                text.style.opacity = '0';
            });
            dots.forEach(dot => {
                dot.classList.remove('active');
            });

            if (slides[index]) {
                slides[index].classList.add('active');
                slides[index].style.opacity = '1';
            }
            if (heroTexts[index]) {
                heroTexts[index].classList.add('active');
                heroTexts[index].style.opacity = '1';
            }
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        let autoSlide = setInterval(nextSlide, interval);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(autoSlide);
                currentSlide = index;
                showSlide(currentSlide);
                autoSlide = setInterval(nextSlide, interval);
            });
        });

        const carouselSection = document.getElementById('home');
        if (carouselSection) {
            carouselSection.addEventListener('mouseenter', () => clearInterval(autoSlide));
            carouselSection.addEventListener('mouseleave', () => {
                autoSlide = setInterval(nextSlide, interval);
            });
        }
    }

    // Navigation Logic
    class NavigationController {
        constructor() {
            this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
            this.mobileMenu = document.getElementById('mobileMenu');
            this.menuIcon = document.getElementById('menuIcon');
            this.body = document.body;
            this.isOpen = false;
            this.init();
        }

        init() {
            this.setupMobileMenu();
            this.setupSmoothScroll();
            this.setupActiveMenuOnScroll();
        }

        setupMobileMenu() {
            if (!this.mobileMenuBtn || !this.mobileMenu) return;

            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen &&
                    !this.mobileMenuBtn.contains(e.target) &&
                    !this.mobileMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            this.mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMobileMenu();
                }
            });
        }

        toggleMobileMenu() {
            if (this.isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.mobileMenu.style.display = 'block';
            this.mobileMenu.classList.add('mobile-menu-enter');
            if (this.menuIcon) this.menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            if (this.mobileMenuBtn) this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
            this.isOpen = true;
        }

        closeMobileMenu() {
            this.mobileMenu.style.display = 'none';
            this.mobileMenu.classList.remove('mobile-menu-enter');
            if (this.menuIcon) this.menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            if (this.mobileMenuBtn) this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            this.isOpen = false;
        }

        setupSmoothScroll() {
            document.querySelectorAll('a[href*="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (!href || href === '#') return;

                    try {
                        const url = new URL(anchor.href, location.href);
                        if (url.origin === location.origin && (url.pathname === location.pathname)) {
                            e.preventDefault();
                            const hash = url.hash;
                            const target = document.querySelector(hash);
                            if (target) {
                                const headerOffset = 100;
                                const elementPosition = target.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                            }
                        }
                    } catch (err) {
                        if (href.startsWith('#')) {
                            e.preventDefault();
                            const target = document.querySelector(href);
                            if (target) {
                                const headerOffset = 100;
                                const elementPosition = target.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                            }
                        }
                    }
                });
            });

            if (location.hash) {
                setTimeout(() => {
                    const target = document.querySelector(location.hash);
                    if (target) {
                        const headerOffset = 100;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                }, 250);
            }
        }

        setupActiveMenuOnScroll() {
            const sections = document.querySelectorAll('section[id]');
            const observerOptions = {
                root: null,
                rootMargin: '-100px 0px -60% 0px',
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.updateActiveMenu(id);
                    }
                });
            }, observerOptions);

            sections.forEach(section => observer.observe(section));
        }

        updateActiveMenu(activeId) {
            document.querySelectorAll('.nav-item, .mobile-link').forEach(link => {
                let linkHash = '';
                try {
                    const url = new URL(link.href, location.href);
                    linkHash = url.hash || '';
                } catch (err) {
                    const href = link.getAttribute('href') || '';
                    if (href.includes('#')) linkHash = `#${href.split('#').pop()}`;
                }

                if (linkHash === `#${activeId}`) {
                    link.classList.add('active');
                } else {
                    if (!link.classList.contains('server-active')) {
                        link.classList.remove('active');
                    }
                }
            });
        }
    }

    new NavigationController();
    new PaketPengujianController();
    new FAQController();
    new TestimoniController();
});

class FAQController {
    constructor() {
        this.init();
    }

    init() {
        window.toggleFAQ = (id) => {
            const answer = document.getElementById(`answer-${id}`);
            const icon = document.getElementById(`icon-${id}`);
            if (!answer || !icon) return;

            const isActive = answer.classList.contains('active');

            // Close all FAQ answers
            document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.faq-icon').forEach(el => el.classList.remove('rotate'));

            // Toggle clicked FAQ
            if (!isActive) {
                answer.classList.add('active');
                icon.classList.add('rotate');
            }
        };
    }
}

class TestimoniController {
    constructor() {
        this.container = document.getElementById('testimonialContainer');
        this.next = document.getElementById('nextBtn');
        this.prev = document.getElementById('prevBtn');
        this.init();
    }

    init() {
        if (!this.container || !this.next || !this.prev) return;

        this.next.addEventListener('click', () => {
            this.container.scrollBy({ left: 340, behavior: 'smooth' });
        });

        this.prev.addEventListener('click', () => {
            this.container.scrollBy({ left: -340, behavior: 'smooth' });
        });
    }
}
