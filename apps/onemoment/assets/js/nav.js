/**
 * nav.js — Navbar, bottom nav, mobile drawer, dropdown logic
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =============== SCROLL: navbar shadow =============== */
    const navbar = document.querySelector('.navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* =============== DESKTOP DROPDOWN =============== */
    // Dropdowns are handled purely via CSS :hover
    // But we also handle click for touch devices
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (!link || !item.querySelector('.dropdown')) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = item.classList.contains('open');
            // Close all
            navItems.forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item')) {
            navItems.forEach(i => i.classList.remove('open'));
        }
    });

    /* =============== MOBILE DRAWER =============== */
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerOverlay = document.querySelector('.drawer-overlay');

    const openDrawer = () => {
        mobileDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (hamburger) hamburger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    /* =============== DRAWER ACCORDION =============== */
    const drawerToggles = document.querySelectorAll('.drawer-menu-toggle');
    drawerToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const item = toggle.closest('.drawer-menu-item');
            const isOpen = item.classList.contains('open');
            // Close all
            document.querySelectorAll('.drawer-menu-item').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.drawer-menu-toggle')?.classList.remove('open');
            });
            // Open clicked if wasn't open
            if (!isOpen) {
                item.classList.add('open');
                toggle.classList.add('open');
            }
        });
    });

    /* =============== BOTTOM NAV =============== */
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            if (target === 'menu') {
                openDrawer();
                return;
            }
            // Set active
            bottomNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // Navigate if href
            if (target && target !== '#') {
                window.location.href = target;
            }
        });
    });

    /* =============== ACTIVE BOTTOM NAV on load =============== */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    bottomNavItems.forEach(item => {
        const t = item.dataset.target;
        if (t && currentPage.includes(t.replace('.html', ''))) {
            item.classList.add('active');
        }
    });
    // Default home active
    const homeItem = document.querySelector('.bottom-nav-item[data-target="index.html"]');
    if (homeItem && currentPage === 'index.html') {
        bottomNavItems.forEach(i => i.classList.remove('active'));
        homeItem.classList.add('active');
    }

});
