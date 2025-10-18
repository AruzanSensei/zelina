// Variables for navbar scroll behavior
let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

// Handle scroll event
window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
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
