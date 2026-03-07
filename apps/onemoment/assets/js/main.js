/**
 * main.js — Scroll animations, FAQ accordion, theme tabs
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =============== SCROLL ANIMATIONS =============== */
    const animatedEls = document.querySelectorAll('[data-animate]');
    if (animatedEls.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );
        animatedEls.forEach(el => observer.observe(el));
    }

    /* =============== FAQ ACCORDION =============== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    /* =============== THEME TABS =============== */
    const themeTabs = document.querySelectorAll('.theme-tab');
    themeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            themeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Future: filter themes by category
        });
    });

    /* =============== HOW IT WORKS STEPS =============== */
    const howItems = document.querySelectorAll('.how-item');
    howItems.forEach((item, i) => {
        item.addEventListener('mouseenter', () => {
            howItems.forEach(h => h.classList.remove('active'));
            item.classList.add('active');
        });
    });
    if (howItems.length) howItems[0].classList.add('active');

    /* =============== COUNTER ANIMATION =============== */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const suffix = el.dataset.suffix || '';
                    let start = 0;
                    const duration = 1800;
                    const step = (timestamp) => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
                        el.textContent = Math.floor(eased * target).toLocaleString('id-ID') + suffix;
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                    countObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(el => countObserver.observe(el));
    }

});
