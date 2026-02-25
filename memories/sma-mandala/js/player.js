/**
 * js/player.js
 * Music player module.
 * Eksposes window.PlayerAPI.init(audioList) yang dipanggil oleh app.js.
 */

(function () {
    let playlist = [];
    let currentIdx = 0;
    let isPlaying = false;
    const favSet = new Set();
    const audio = new Audio();

    /* ── DOM refs (tersedia karena script dimuat setelah body) ── */
    const elTitle = document.getElementById('player-title');
    const elPlay = document.getElementById('btn-play');
    const elIconPlay = document.getElementById('icon-play');
    const elIconPause = document.getElementById('icon-pause');
    const elFill = document.getElementById('progress-fill');
    const elThumb = document.getElementById('progress-thumb');
    const elCurrent = document.getElementById('time-current');
    const elTotal = document.getElementById('time-total');
    const elWrap = document.getElementById('progress-wrap');
    const elPlaylist = document.getElementById('playlist-panel');
    const elPlInner = document.getElementById('playlist-inner');
    const elBtnFav = document.getElementById('btn-fav');

    /* ── Helpers ── */
    function fmtTime(s) {
        if (!s || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    }

    function setLoading(on) { elPlay.classList.toggle('loading', on); }

    function updatePlayUI() {
        elIconPlay.style.display = isPlaying ? 'none' : '';
        elIconPause.style.display = isPlaying ? '' : 'none';
    }

    function updateTitle() {
        const s = playlist[currentIdx];
        elTitle.innerHTML = `${s.title} <small>— ${s.artist}</small>`;
    }

    function buildPlaylist() {
        elPlInner.innerHTML = '';
        playlist.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'pl-item' + (i === currentIdx ? ' active' : '');
            div.innerHTML =
                `<span class="pl-num">${i + 1}</span>` +
                `<span class="pl-name">${s.title} — <em>${s.artist}</em></span>` +
                `<span class="pl-duration" id="pl-dur-${i}">–:––</span>`;
            div.addEventListener('click', () => loadTrack(i, true));
            elPlInner.appendChild(div);
        });
    }

    function refreshActive() {
        document.querySelectorAll('.pl-item').forEach((el, i) =>
            el.classList.toggle('active', i === currentIdx)
        );
    }

    function updateFavBtn() {
        elBtnFav.classList.toggle('active', favSet.has(currentIdx));
    }

    function loadTrack(idx, autoplay) {
        currentIdx = idx;
        const s = playlist[idx];
        audio.src = s.src;
        updateTitle();
        refreshActive();
        elFill.style.width = '0%';
        elThumb.style.left = '0%';
        elCurrent.textContent = '0:00';
        elTotal.textContent = '0:00';
        updateFavBtn();
        if (autoplay) {
            setLoading(true);
            audio.play()
                .then(() => { isPlaying = true; setLoading(false); updatePlayUI(); })
                .catch(() => setLoading(false));
        } else {
            isPlaying = false;
            updatePlayUI();
        }
    }

    function togglePlay() {
        if (audio.readyState === 0) { setLoading(true); audio.load(); }
        if (isPlaying) {
            audio.pause(); isPlaying = false; updatePlayUI();
        } else {
            setLoading(true);
            audio.play()
                .then(() => { isPlaying = true; setLoading(false); updatePlayUI(); })
                .catch(() => setLoading(false));
        }
    }

    /* ── Audio events ── */
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        elFill.style.width = pct + '%';
        elThumb.style.left = pct + '%';
        elCurrent.textContent = fmtTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        elTotal.textContent = fmtTime(audio.duration);
        const durEl = document.getElementById(`pl-dur-${currentIdx}`);
        if (durEl) durEl.textContent = fmtTime(audio.duration);
    });

    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('canplay', () => setLoading(false));
    audio.addEventListener('ended', () => {
        loadTrack((currentIdx + 1) % playlist.length, true);
    });

    /* ── Scrubbing (mouse + touch) ── */
    let scrubbing = false;
    function scrubTo(clientX) {
        const rect = elWrap.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        if (audio.duration) audio.currentTime = (x / rect.width) * audio.duration;
    }

    elWrap.addEventListener('mousedown', e => { scrubbing = true; scrubTo(e.clientX); });
    document.addEventListener('mousemove', e => { if (scrubbing) scrubTo(e.clientX); });
    document.addEventListener('mouseup', () => { scrubbing = false; });
    elWrap.addEventListener('touchstart', e => { scrubbing = true; scrubTo(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('touchmove', e => { if (scrubbing) scrubTo(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('touchend', () => { scrubbing = false; });

    /* ── Buttons ── */
    elPlay.addEventListener('click', togglePlay);

    document.getElementById('btn-prev').addEventListener('click', () =>
        loadTrack((currentIdx - 1 + playlist.length) % playlist.length, isPlaying)
    );
    document.getElementById('btn-next').addEventListener('click', () =>
        loadTrack((currentIdx + 1) % playlist.length, isPlaying)
    );
    document.getElementById('btn-playlist').addEventListener('click', () =>
        elPlaylist.classList.toggle('open')
    );
    elBtnFav.addEventListener('click', () => {
        favSet.has(currentIdx) ? favSet.delete(currentIdx) : favSet.add(currentIdx);
        updateFavBtn();
    });

    /* ── Public API — dipanggil oleh app.js setelah manifest di-fetch ── */
    window.PlayerAPI = {
        init(audioList, autoplay = false) {
            playlist = audioList;
            buildPlaylist();
            loadTrack(0, autoplay);
        },
        loadTrack,
        togglePlay,
    };
})();
