// Variables for navbar scroll behavior
let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

// Handle scroll event
window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove background based on scroll position
    if (scrollTop > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Show/hide navbar based on scroll direction
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down & past 100px - hide navbar
        navbar.classList.add('hide');
    } else {
        // Scrolling up or near top - show navbar
        navbar.classList.remove('hide');
    }
    
    lastScrollTop = scrollTop;
});
