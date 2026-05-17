/* ====================================================
   TOAST
==================================================== */
let _toastTimer = null;

function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ====================================================
   MODAL / SHEET
==================================================== */
let _sheetOnClose = null;

function openSheet(builder) {
    const ov = document.getElementById('ov');
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = ''; // clear old
    builder(sheet);       // populate new content
    // force reflow then show (ensures CSS transition fires)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { ov.classList.add('show'); });
    });
    // backdrop close
    ov.onclick = e => { if (e.target === ov) closeSheet(); };
}

function closeSheet(after) {
    const ov = document.getElementById('ov');
    ov.classList.remove('show');
    _sheetOnClose = null;
    if (typeof after === 'function') {
        // wait for sheet animation to finish before callback
        setTimeout(after, 350);
    }
}

/* ====================================================
   PMO FORM SHEET
==================================================== */
function openForm({ date, time, rec, onSave } = {}) {
    date = date || todayStr();
    time = time || nowTimeStr();
    const isEdit = !!rec;
    const r = rec || { tempat: '', waktu: '', media: '', catatan: '' };

    openSheet(sh => {
        sh.innerHTML = `
      <div class="sh-handle"></div>
      <div class="sh-title">${isEdit ? 'Edit Catatan PMO' : 'Tambah Catatan PMO'}</div>
      <div class="sh-body">
        <div class="frow">
          <div class="fg">
            <label class="flbl">📅 Tanggal</label>
            <input class="fi" type="date" id="f-date" value="${esc(date)}">
          </div>
          <div class="fg">
            <label class="flbl">🕐 Jam</label>
            <input class="fi" type="time" id="f-time" value="${esc(time)}">
          </div>
        </div>
        <div class="fg">
          <label class="flbl">📍 Tempat</label>
          <input class="fi" type="text" id="f-tempat" placeholder="Kamar Tidur, Kamar Mandi..." value="${esc(r.tempat)}">
        </div>
        <div class="fg">
          <label class="flbl">🕐 Waktu</label>
          <input class="fi" type="text" id="f-waktu" placeholder="Pagi, Siang, Sore, Malam..." value="${esc(r.waktu)}">
        </div>
        <div class="fg">
          <label class="flbl">📱 Media</label>
          <input class="fi" type="text" id="f-media" placeholder="YouTube, Instagram..." value="${esc(r.media)}">
        </div>
        <div class="fg">
          <label class="flbl">📝 Catatan Evaluasi</label>
          <textarea class="fi" id="f-cat" placeholder="Apa yang memicu? Bagaimana perasaanmu?">${esc(r.catatan)}</textarea>
        </div>
      </div>
      <div class="sh-actions">
        <button class="btn-sec" id="f-batal">Batal</button>
        <button class="btn-pri" id="f-simpan">${isEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
      </div>`;

        sh.querySelector('#f-batal').addEventListener('click', () => closeSheet());

        sh.querySelector('#f-simpan').addEventListener('click', () => {
            const dt = sh.querySelector('#f-date').value;
            const tm = sh.querySelector('#f-time').value;
            const tpt = sh.querySelector('#f-tempat').value;
            const twk = sh.querySelector('#f-waktu').value;
            const tmd = sh.querySelector('#f-media').value;
            const cat = sh.querySelector('#f-cat').value;

            if (!dt || !tm) {
                showToast('⚠️ Tanggal dan jam wajib diisi!');
                return;
            }

            let saved;
            if (isEdit) {
                saved = DB.edit(r.id, { date: dt, time: tm, tempat: tpt, waktu: twk, media: tmd, catatan: cat });
                showToast('✅ Catatan diperbarui');
            } else {
                saved = DB.add({ date: dt, time: tm, tempat: tpt, waktu: twk, media: tmd, catatan: cat });
                showToast('✅ Catatan ditambahkan');
            }

            closeSheet(() => { if (typeof onSave === 'function') onSave(saved); });
        });
    });
}

/* ====================================================
   DATE SHEET
==================================================== */
function openDateSheet(ds, { onSave } = {}) {
    openSheet(sh => {
        const recs = DB.byDate(ds);
        const cnt = recs.length;
        const clrMap = { '': '#3b82f6', p1: '#ca8a04', p2: '#ef4444', p3: '#1e293b' };
        const color = clrMap[pmoClass(cnt)] || '#3b82f6';

        sh.innerHTML = `
      <div class="sh-handle"></div>
      <div class="sh-title">
        📅 ${fmtFull(ds)}
        <span style="font-size:12px;font-weight:600;color:${color}"> · ${cnt}x PMO</span>
      </div>
      <div class="dbar">
        <button class="dbtn dbtn-add" id="ds-add">+ Tambah Catatan</button>
      </div>
      <div class="dlist" id="ds-list"></div>
      <div style="height:20px"></div>`;

        const list = sh.querySelector('#ds-list');

        if (!recs.length) {
            list.innerHTML = '<div class="dempty">Tidak ada catatan PMO pada hari ini 🎉</div>';
        } else {
            recs.forEach(r => {
                const card = buildLogCard(r, {
                    onDel: () => closeSheet(() => { if (onSave) onSave(); }),
                    onEdit: rec => closeSheet(() => {
                        setTimeout(() => openForm({
                            date: rec.date, time: rec.time, rec,
                            onSave: () => { if (onSave) onSave(); }
                        }), 50);
                    })
                });
                list.appendChild(card);
            });
        }

        sh.querySelector('#ds-add').addEventListener('click', () => {
            closeSheet(() => {
                setTimeout(() => openForm({
                    date: ds, time: nowTimeStr(),
                    onSave: () => { if (onSave) onSave(); }
                }), 50);
            });
        });
    });
}

/* ====================================================
   LOG CARD BUILDER
==================================================== */
function buildLogCard(rec, { onDel, onEdit } = {}) {
    const tagsHtml = [
        rec.tempat ? `<span class="tag tag-t">📍 ${esc(rec.tempat)}</span>` : '',
        rec.waktu ? `<span class="tag tag-w">🕐 ${esc(rec.waktu)}</span>` : '',
        rec.media ? `<span class="tag tag-m">📱 ${esc(rec.media)}</span>` : '',
    ].filter(Boolean).join('');

    const el = document.createElement('div');
    el.className = 'lc';
    el.innerHTML = `
    <div class="lc-hdr">
      <div>
        <div class="lc-date">${fmtFull(rec.date)}</div>
        <div class="lc-time">Pukul ${esc(rec.time)}</div>
      </div>
      <span class="lc-chev">▾</span>
    </div>
    <div class="lc-body">
      <div class="lc-inner">
        <div class="tags-wrap">${tagsHtml || '<span style="font-size:11px;color:var(--textm)">Tidak ada tag</span>'}</div>
        <div class="note-lbl">Catatan Evaluasi</div>
        <div class="note-txt">${rec.catatan ? esc(rec.catatan) : '<em style="color:var(--textm)">Belum ada catatan</em>'}</div>
        <div class="lc-acts">
          <button class="bxs bedit">✏️ Edit</button>
          <button class="bxs bdel">🗑 Hapus</button>
        </div>
      </div>
    </div>`;

    el.querySelector('.lc-hdr').addEventListener('click', () => el.classList.toggle('open'));
    el.querySelector('.bedit').addEventListener('click', e => { e.stopPropagation(); if (onEdit) onEdit(rec); });
    el.querySelector('.bdel').addEventListener('click', e => {
        e.stopPropagation();
        if (confirm('Hapus catatan ini?')) {
            DB.del(rec.id);
            el.style.opacity = '0';
            el.style.transform = 'scale(.95)';
            el.style.transition = 'all .2s';
            setTimeout(() => { el.remove(); if (onDel) onDel(); }, 200);
        }
    });

    return el;
}
