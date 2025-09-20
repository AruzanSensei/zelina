// JavaScript for mobile menu toggle and product slider
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('nav').classList.toggle('active');
});

// Back to top button functionality
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Newsletter form validation
const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    if (emailInput.value.includes('@')) {
        alert('Terima kasih telah berlangganan newsletter kami!');
        emailInput.value = '';
    } else {
        alert('Masukkan alamat email yang valid');
    }
});

function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('active');
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
            // Close menu if mobile
            if (window.innerWidth <= 768) {
                document.getElementById('nav-menu').classList.remove('active');
            }
        }
    });
});

// Product carousel with navigation buttons
const productScroll = document.querySelector('.product-scroll');
if (productScroll) {
    const navContainer = document.createElement('div');
    navContainer.className = 'carousel-nav';
    
    const prevBtn = document.createElement('button');
    const nextBtn = document.createElement('button');
    
    prevBtn.className = 'carousel-btn prev';
    nextBtn.className = 'carousel-btn next';
    prevBtn.innerHTML = '&larr;';
    nextBtn.innerHTML = '&rarr;';
    
    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);
    productScroll.parentNode.appendChild(navContainer);
    
    const scrollAmount = 300;
    const scrollDuration = 500;
    
    const smoothScroll = (element, direction) => {
        const start = element.scrollLeft;
        let end;
        
        if (direction === 'next') {
            end = start + scrollAmount;
            if (end >= element.scrollWidth - element.clientWidth) {
                end = 0; // Loop to start
            }
        } else {
            end = start - scrollAmount;
            if (end < 0) {
                end = element.scrollWidth - element.clientWidth; // Loop to end
            }
        }
        
        const change = end - start;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            const ease = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            element.scrollLeft = start + change * ease;
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    };
    
    prevBtn.addEventListener('click', () => smoothScroll(productScroll, 'prev'));
    nextBtn.addEventListener('click', () => smoothScroll(productScroll, 'next'));
    
    // Always show both buttons
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
}
