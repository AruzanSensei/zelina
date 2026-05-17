// Positivus Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Process Accordion
    const processItems = document.querySelectorAll('.process-item');
    
    processItems.forEach(item => {
        const toggle = item.querySelector('.process-toggle');
        if (toggle) {
            toggle.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all items
                processItems.forEach(i => {
                    i.classList.remove('active');
                    const content = i.querySelector('.process-content');
                    if (content) {
                        content.style.display = 'none';
                    }
                    // Change icon to plus
                    const icon = i.querySelector('.process-toggle img');
                    if (icon) {
                        icon.src = 'https://www.figma.com/api/mcp/asset/2c7ed97a-9c60-4b8f-99ce-c3229ad8a2e4';
                    }
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    const content = item.querySelector('.process-content');
                    if (content) {
                        content.style.display = 'block';
                    }
                    // Change icon to minus
                    const icon = item.querySelector('.process-toggle img');
                    if (icon) {
                        icon.src = 'https://www.figma.com/api/mcp/asset/b7ae953c-0954-4b88-bf1c-6dd7be1fd787';
                    }
                }
            });
        }
    });
    
    // Testimonials Carousel
    const carousel = document.querySelector('.testimonials-slides');
    const prevBtn = document.querySelector('.carousel-arrow[aria-label="Previous"]');
    const nextBtn = document.querySelector('.carousel-arrow[aria-label="Next"]');
    
    if (carousel && prevBtn && nextBtn) {
        let scrollPosition = 0;
        const cardWidth = 606; // Width of testimonial card
        const gap = 40; // Gap between cards
        
        prevBtn.addEventListener('click', function() {
            scrollPosition = Math.max(0, scrollPosition - (cardWidth + gap));
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', function() {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            scrollPosition = Math.min(maxScroll, scrollPosition + (cardWidth + gap));
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        });
        
        // Update scroll position on scroll
        carousel.addEventListener('scroll', function() {
            scrollPosition = carousel.scrollLeft;
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Form submission (mock)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
    
    // Newsletter subscription (mock)
    const subscribeBtn = document.querySelector('.footer-subscribe .btn');
    const subscribeInput = document.querySelector('.subscribe-input');
    
    if (subscribeBtn && subscribeInput) {
        subscribeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const email = subscribeInput.value;
            if (email) {
                alert('Thank you for subscribing!');
                subscribeInput.value = '';
            } else {
                alert('Please enter your email address.');
            }
        });
    }
    
    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.nav-bar');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
});
