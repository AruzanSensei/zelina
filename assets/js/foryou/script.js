document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.main-button');
    const content = document.querySelector('.content');
    let isClicked = false;

    button.addEventListener('click', () => {
        if (isClicked) return;
        isClicked = true;

        // Hide button with smooth animation
        button.style.transition = 'all 0.5s ease';
        button.style.opacity = '0';
        button.style.transform = 'scale(0.8)';
        
        // Show content after button animation
        setTimeout(() => {
            button.style.display = 'none';
            content.style.display = 'block';
        }, 500);
    });
}); 