/**
 * hero.js — Hero section: typewriter effect for highlighted words
 */

document.addEventListener('DOMContentLoaded', () => {
    const highlight = document.querySelector('.hero-title .highlight');
    if (!highlight) return;

    const words = ['Tunangan', 'Pernikahan', 'Ulang Tahun', 'Khitanan', 'Wisuda'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 120;

    const type = () => {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            highlight.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 60;
        } else {
            highlight.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 1800; // pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 400;
        }

        setTimeout(type, typingSpeed);
    };

    type();
});
