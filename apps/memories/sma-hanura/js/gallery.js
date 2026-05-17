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
            // Gunakan data-src agar browser tidak langsung mengunduh sebelum masuk viewport
            const mediaHTML = item.type === 'video'
                ? `<video data-src="${item.src}" muted loop playsinline></video>`
                : `<img data-src="${item.src}" alt="${item.caption ?? ''}">`;

            card.innerHTML = `${badge}<div class="photo-wrap">${mediaHTML}</div><div class="caption-area"><div class="caption">${item.caption ?? ' '}</div></div>`;
            card.addEventListener('click', () => openLightbox(item));
            gallery.appendChild(card);
        });

        // Observer 1: animasi scroll-in (card muncul)
        const visibilityObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); visibilityObserver.unobserve(e.target); }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -14px 0px' });

        // Observer 2: lazy load media — src di-set hanya saat mendekati viewport
        const mediaObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const card = e.target;
                // Load image
                const img = card.querySelector('img[data-src]');
                if (img) { img.src = img.dataset.src; delete img.dataset.src; }
                // Load video — set src dan mulai play
                const vid = card.querySelector('video[data-src]');
                if (vid) {
                    vid.src = vid.dataset.src;
                    delete vid.dataset.src;
                    vid.play().catch(() => { });
                }
                mediaObserver.unobserve(card);
            });
        }, { threshold: 0, rootMargin: '0px 0px 200px 0px' }); // 200px sebelum masuk viewport

        document.querySelectorAll('.polaroid').forEach(el => {
            visibilityObserver.observe(el);
            mediaObserver.observe(el);
        });
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
