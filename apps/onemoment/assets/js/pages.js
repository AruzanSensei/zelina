/**
 * pages.js — Shared components loader for inner pages
 * Injects navbar, bottom nav, and mobile drawer dynamically
 * so we don't repeat markup on every page.
 */

const PAGES = {
    home: { label: 'Home', href: 'index.html', icon: 'fa-house' },
    website: { label: 'Website', href: 'website.html', icon: 'fa-globe' },
    video: { label: 'Video', href: 'video.html', icon: 'fa-clapperboard' },
    cetak: { label: 'Cetak', href: 'cetak.html', icon: 'fa-print' },
};

const NAV_MENUS = [
    {
        label: 'Products',
        children: [
            { label: 'Undangan Website', href: 'website.html' },
            { label: 'Undangan Cetak', href: 'cetak.html' },
            { label: 'Undangan Video 3D', href: 'video.html' },
            { label: 'Video Ucapan 3D', href: 'video.html' },
        ]
    },
    {
        label: 'Solutions',
        children: [
            { label: 'Pilih Tema', href: 'tema.html' },
            { label: 'Harga & Paket', href: 'harga.html' },
            { label: 'FAQ', href: 'faq.html' },
        ]
    },
    {
        label: 'Partners',
        children: [
            { label: 'Jadi Reseller', href: '#' },
            { label: 'Afiliasi', href: '#' },
        ]
    },
    {
        label: 'Company',
        children: [
            { label: 'Blog', href: 'blog.html' },
            { label: 'Tentang Kami', href: '#' },
        ]
    },
    {
        label: 'Harga',
        children: [
            { label: 'Paket Gratis', href: 'harga.html' },
            { label: 'Paket Premium', href: 'harga.html' },
        ]
    },
];

// Helper to get the current file name
const getCurrentPage = () => window.location.pathname.split('/').pop() || 'index.html';
