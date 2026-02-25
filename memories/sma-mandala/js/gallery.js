/**
 * js/gallery.js
 * Gallery & Lightbox — reads from window.MANIFEST.media
 */

(function () {
    const TILTS = {
        'tilt-left': '-2.5deg',
        'tilt-right': '1.8deg',
        'tilt-mini-left': '-1deg',
        'tilt-mini-right': '0.8deg',
    };

    const TILT_CYCLE = ['tilt-left tape-top', 'tilt-right tape-left', 'tilt-mini-left', 'tilt-mini-right tape-top', 'tilt-left tape-left', 'tilt-right', 'tilt-mini-left tape-top'];
    const gallery = document.getElementById('gallery');

    function getTiltDeg(cls) {
        const key = Object.keys(TILTS).find(k => cls.includes(k));
        return key ? TILTS[key] : '0deg';
    }

    function buildGallery(items) {
        items.forEach((item, i) => {
            const tiltCls = TILT_CYCLE[i % TILT_CYCLE.length];
            const card = document.createElement('div');
            card.className = `polaroid ${tiltCls}`;
            card.style.setProperty('--base-tilt', getTiltDeg(tiltCls));
            card.style.transitionDelay = `${(i % 2) * 75}ms`;

            const badge = item.type === 'video'
                ? `<div class="video-badge">▶ video</div>` : '';
            const mediaHTML = item.type === 'video'
                ? `<video src="${item.src}" autoplay muted loop playsinline></video>`
                : `<img src="${item.src}" alt="${item.caption}" loading="lazy">`;

            card.innerHTML = `${badge}<div class="photo-wrap">${mediaHTML}</div><div class="caption-area"><div class="caption">${item.caption}</div></div>`;
            card.addEventListener('click', () => openLightbox(item));
            gallery.appendChild(card);
        });

        // Scroll-in observer
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -14px 0px' });

        document.querySelectorAll('.polaroid').forEach(el => observer.observe(el));
    }

    /* ── Lightbox ── */
    function openLightbox(item) {
        const mediaEl = document.getElementById('lightbox-media');
        mediaEl.innerHTML = '';
        if (item.type === 'video') {
            const v = document.createElement('video');
            Object.assign(v, { src: item.src, autoplay: true, muted: true, loop: true, playsInline: true });
            v.style.pointerEvents = 'none';
            mediaEl.appendChild(v);
        } else {
            const img = document.createElement('img');
            img.src = item.src; img.alt = item.caption;
            mediaEl.appendChild(img);
        }
        document.getElementById('lb-caption').textContent = item.caption;
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.getElementById('lightbox-media').innerHTML = '';
        document.body.style.overflow = '';
    }

    document.getElementById('lb-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox').addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    window.GalleryAPI = { buildGallery };
})();
