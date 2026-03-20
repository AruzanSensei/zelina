'use strict';

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
const STORAGE_KEY = 'taskflow_v4';

let state = {
  mode:         'editor',
  accentColor:  '#007AFF',
  headerColor:  '#F5F5F7',
  colLayout:    '2',
  itemFontSize: 13,
  showProgress: true,
  wallTheme:    'light',
  itemsPerPage: 10,
  docTitle:     'TODO',
  docSubtitle:  '',
  pages:        []
};

/* ── helpers ── */
let _uid = Date.now();
const uid = () => 'id' + (_uid++).toString(36);
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function findGroup(gid){ for(const p of state.pages){ const g=p.groups.find(g=>g.id===gid); if(g) return g; } return null; }
function findItem(iid){ for(const p of state.pages) for(const g of p.groups){ const i=g.items.find(i=>i.id===iid); if(i) return i; } return null; }
function autoResize(ta){ ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px'; }

/* ── save / load ── */
function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){} }
function loadSaved(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const saved = JSON.parse(raw);
      // merge — don't clobber defaults for missing keys
      Object.keys(saved).forEach(k => { if(k in state) state[k] = saved[k]; });
      return saved.pages && saved.pages.length > 0;
    }
  }catch(e){}
  return false;
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
let _tt;
function toast(msg, ms=2200){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(()=>el.classList.remove('show'), ms);
}

/* ══════════════════════════════════════════
   STATS (safe — only update if elements exist)
══════════════════════════════════════════ */
function updateStats(){
  let total=0, done=0;
  state.pages.forEach(p=>p.groups.forEach(g=>{ total+=g.items.length; done+=g.items.filter(i=>i.done).length; }));
  const t = document.getElementById('stat-total');
  const d = document.getElementById('stat-done');
  if(t) t.textContent = total+' item';
  if(d) d.textContent = done+' selesai';
}

/* ══════════════════════════════════════════
   EDITOR — RENDER
══════════════════════════════════════════ */
function renderEditor(){
  const container = document.getElementById('pages-container');
  if(!container) return;
  container.innerHTML = '';

  if(!state.pages.length){
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✦</div>
      <div class="empty-state-text">Belum ada halaman.<br>Klik "+ Halaman" untuk mulai.</div>
    </div>`;
    updateStats();
    return;
  }

  state.pages.forEach((page,pi) => container.appendChild(buildPageCard(page,pi)));
  applyEditorCSS();
  updateStats();
}

function buildPageCard(page, pi){
  const card = document.createElement('div');
  card.className = 'page-card';
  card.dataset.pageId = page.id;
  card.innerHTML = `
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-num">Halaman ${pi+1}</div>
        <input class="page-title-input" type="text" value="${esc(page.title)}" placeholder="Judul halaman...">
      </div>
      <div class="page-header-actions">
        <button class="icon-btn pg-up" title="Naik" ${pi===0?'disabled':''}>↑</button>
        <button class="icon-btn pg-dn" title="Turun" ${pi===state.pages.length-1?'disabled':''}>↓</button>
        <button class="icon-btn pg-del" title="Hapus">✕</button>
      </div>
    </div>
    <div class="page-body">
      <div class="groups-grid ${state.colLayout==='2'?'cols-2':''}" data-page-id="${page.id}"></div>
    </div>
    <div class="page-footer">
      <button class="btn-add-group-inline" data-pid="${page.id}">+ Tambah Group</button>
    </div>`;

  card.querySelector('.page-title-input').addEventListener('input', e=>{
    const p=state.pages.find(p=>p.id===page.id); if(p){ p.title=e.target.value; saveState(); }
  });
  card.querySelector('.pg-del').addEventListener('click', ()=>deletePage(page.id));
  card.querySelector('.pg-up').addEventListener('click',  ()=>movePage(page.id,-1));
  card.querySelector('.pg-dn').addEventListener('click',  ()=>movePage(page.id, 1));
  card.querySelector('.btn-add-group-inline').addEventListener('click', ()=>addGroup(page.id));

  const grid = card.querySelector('.groups-grid');
  page.groups.forEach(g => grid.appendChild(buildGroupCard(g, page.id)));
  setupDragDrop(grid, page.id);
  return card;
}

function buildGroupCard(group, pageId){
  const card = document.createElement('div');
  card.className = 'group-card';
  card.dataset.groupId = group.id;
  card.draggable = true;

  const done  = group.items.filter(i=>i.done).length;
  const total = group.items.length;
  const pct   = total>0 ? Math.round(done/total*100) : 0;

  card.innerHTML = `
    <div class="group-header">
      <span class="group-drag-handle" title="Seret">⠿</span>
      <input class="group-name-input" type="text" value="${esc(group.name)}" placeholder="Nama group...">
      ${state.showProgress&&total>0 ? `<span class="group-progress">${done}/${total}</span>` : ''}
      <div class="group-actions">
        <button class="group-action-btn g-up"  title="Naik">↑</button>
        <button class="group-action-btn g-dn"  title="Turun">↓</button>
        <button class="group-action-btn danger g-del" title="Hapus">✕</button>
      </div>
    </div>
    ${state.showProgress&&total>0 ? `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>` : ''}
    <div class="todo-list"></div>
    <button class="btn-add-item">Tambah item</button>`;

  card.querySelector('.group-name-input').addEventListener('input', e=>{
    const g=findGroup(group.id); if(g){ g.name=e.target.value; saveState(); }
  });
  card.querySelector('.g-del').addEventListener('click', ()=>deleteGroup(pageId,group.id));
  card.querySelector('.g-up').addEventListener('click',  ()=>moveGroup(pageId,group.id,-1));
  card.querySelector('.g-dn').addEventListener('click',  ()=>moveGroup(pageId,group.id, 1));
  card.querySelector('.btn-add-item').addEventListener('click', ()=>addItem(pageId,group.id));

  const list = card.querySelector('.todo-list');
  group.items.forEach(item => list.appendChild(buildItemRow(item,group.id,pageId)));
  return card;
}

function buildItemRow(item, groupId, pageId){
  const row = document.createElement('div');
  row.className = 'todo-item'+(item.done?' is-done':'');
  row.dataset.itemId = item.id;

  const pc = item.priority ? ' p-'+item.priority : '';
  row.innerHTML = `
    <div class="${item.done?'todo-check checked':'todo-check'}" role="checkbox" aria-checked="${item.done}" tabindex="0"></div>
    <div class="todo-priority${pc}" title="Klik untuk ubah prioritas"></div>
    <textarea class="todo-text-input" rows="1" placeholder="Tulis item...">${esc(item.text)}</textarea>
    <button class="todo-del-btn" title="Hapus">✕</button>`;

  const ta  = row.querySelector('.todo-text-input');
  const chk = row.querySelector('.todo-check');
  const dot = row.querySelector('.todo-priority');
  const del = row.querySelector('.todo-del-btn');

  autoResize(ta);
  ta.addEventListener('input', ()=>{
    const it=findItem(item.id); if(it) it.text=ta.value;
    autoResize(ta); saveState(); updateStats();
  });
  ta.addEventListener('keydown', e=>{
    if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); addItemAfter(pageId,groupId,item.id); }
    if(e.key==='Backspace'&&ta.value===''){ e.preventDefault(); deleteItem(pageId,groupId,item.id); }
  });

  const toggle = ()=>{
    const it=findItem(item.id); if(!it) return;
    it.done=!it.done;
    row.classList.toggle('is-done',it.done);
    chk.classList.toggle('checked',it.done);
    chk.setAttribute('aria-checked',it.done);
    refreshGroupProgress(row.closest('.group-card'));
    saveState(); updateStats();
  };
  chk.addEventListener('click', toggle);
  chk.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggle(); } });

  dot.addEventListener('click', ()=>{
    const it=findItem(item.id); if(!it) return;
    const cy=['','urgent','important','moderate','leisure'];
    it.priority = cy[(cy.indexOf(it.priority)+1)%cy.length];
    dot.className = 'todo-priority'+(it.priority?' p-'+it.priority:'');
    saveState();
  });

  del.addEventListener('click', ()=>deleteItem(pageId,groupId,item.id));
  return row;
}

function refreshGroupProgress(card){
  if(!card) return;
  const g = findGroup(card.dataset.groupId);
  if(!g) return;
  const t=g.items.length, d=g.items.filter(i=>i.done).length;
  const p=card.querySelector('.group-progress');   if(p) p.textContent=`${d}/${t}`;
  const f=card.querySelector('.progress-bar-fill'); if(f) f.style.width=(t>0?Math.round(d/t*100):0)+'%';
}

/* refresh a single group in-place (no full re-render) */
function refreshGroup(groupId, pageId){
  const g = findGroup(groupId);
  const old = document.querySelector(`.group-card[data-group-id="${groupId}"]`);
  if(g && old){ old.replaceWith(buildGroupCard(g, pageId)); applyEditorCSS(); }
}

function applyEditorCSS(){
  document.documentElement.style.setProperty('--accent',    state.accentColor);
  document.documentElement.style.setProperty('--header-bg', state.headerColor);
  document.documentElement.style.setProperty('--item-fs',   state.itemFontSize+'px');
  document.querySelectorAll('.groups-grid').forEach(g=>g.classList.toggle('cols-2',state.colLayout==='2'));
  document.querySelectorAll('.todo-text-input').forEach(autoResize);
}

/* ══════════════════════════════════════════
   ITEM CRUD
══════════════════════════════════════════ */
function addItem(pageId, groupId){
  const page=state.pages.find(p=>p.id===pageId); if(!page) return;
  const g=page.groups.find(g=>g.id===groupId);    if(!g) return;
  const item={id:uid(),text:'',done:false,priority:'',tag:''};
  g.items.push(item);
  saveState(); refreshGroup(groupId,pageId);
  setTimeout(()=>{ const el=document.querySelector(`.todo-item[data-item-id="${item.id}"] .todo-text-input`); if(el) el.focus(); },40);
  updateStats();
}

function addItemAfter(pageId, groupId, afterId){
  const page=state.pages.find(p=>p.id===pageId); if(!page) return;
  const g=page.groups.find(g=>g.id===groupId);    if(!g) return;
  const idx=g.items.findIndex(i=>i.id===afterId);
  const item={id:uid(),text:'',done:false,priority:'',tag:''};
  g.items.splice(idx+1,0,item);
  saveState(); refreshGroup(groupId,pageId);
  setTimeout(()=>{ const el=document.querySelector(`.todo-item[data-item-id="${item.id}"] .todo-text-input`); if(el) el.focus(); },40);
  updateStats();
}

function deleteItem(pageId, groupId, itemId){
  const page=state.pages.find(p=>p.id===pageId); if(!page) return;
  const g=page.groups.find(g=>g.id===groupId);    if(!g) return;
  const idx=g.items.findIndex(i=>i.id===itemId);
  const prevId=idx>0?g.items[idx-1].id:null;
  g.items=g.items.filter(i=>i.id!==itemId);
  saveState(); refreshGroup(groupId,pageId);
  if(prevId) setTimeout(()=>{ const el=document.querySelector(`.todo-item[data-item-id="${prevId}"] .todo-text-input`); if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);} },40);
  updateStats();
}

/* ══════════════════════════════════════════
   GROUP CRUD
══════════════════════════════════════════ */
function addGroup(pageId){
  const page=state.pages.find(p=>p.id===pageId); if(!page) return;
  const g={id:uid(),name:'',items:[]};
  page.groups.push(g);
  saveState(); renderEditor();
  setTimeout(()=>{ const el=document.querySelector(`.group-card[data-group-id="${g.id}"] .group-name-input`); if(el) el.focus(); },50);
}

function deleteGroup(pageId, groupId){
  const page=state.pages.find(p=>p.id===pageId); if(!page) return;
  const g=page.groups.find(g=>g.id===groupId);
  if(g&&g.items.length&&!confirm(`Hapus group "${g.name||'tanpa nama'}" dan ${g.items.length} item?`)) return;
  page.groups=page.groups.filter(g=>g.id!==groupId);
  saveState(); renderEditor();
}

function moveGroup(pageId, groupId, dir){
  const page=state.pages.find(p=>p.id===pageId); if(!page) return;
  const idx=page.groups.findIndex(g=>g.id===groupId);
  const ni=idx+dir;
  if(ni<0||ni>=page.groups.length) return;
  [page.groups[idx],page.groups[ni]]=[page.groups[ni],page.groups[idx]];
  saveState(); renderEditor();
}

/* ══════════════════════════════════════════
   PAGE CRUD
══════════════════════════════════════════ */
function addPage(){
  state.pages.push({id:uid(),title:'Halaman Baru',groups:[]});
  saveState(); renderEditor();
  setTimeout(()=>{ const cs=document.querySelectorAll('.page-card'); if(cs.length) cs[cs.length-1].scrollIntoView({behavior:'smooth',block:'start'}); },50);
}

function deletePage(pageId){
  if(state.pages.length<=1){ toast('Minimal satu halaman'); return; }
  if(!confirm('Hapus halaman ini?')) return;
  state.pages=state.pages.filter(p=>p.id!==pageId);
  saveState(); renderEditor();
}

function movePage(pageId, dir){
  const idx=state.pages.findIndex(p=>p.id===pageId);
  const ni=idx+dir;
  if(ni<0||ni>=state.pages.length) return;
  [state.pages[idx],state.pages[ni]]=[state.pages[ni],state.pages[idx]];
  saveState(); renderEditor();
}

/* ══════════════════════════════════════════
   DRAG & DROP
══════════════════════════════════════════ */
let _drag=null;
function setupDragDrop(grid, pageId){
  grid.addEventListener('dragstart',e=>{
    const c=e.target.closest('.group-card'); if(!c) return;
    _drag={gid:c.dataset.groupId,pid:pageId};
    c.classList.add('dragging'); e.dataTransfer.effectAllowed='move';
  });
  grid.addEventListener('dragend',()=>{
    document.querySelectorAll('.dragging,.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));
    _drag=null;
  });
  grid.addEventListener('dragover',e=>{
    e.preventDefault();
    const c=e.target.closest('.group-card');
    if(c&&_drag&&c.dataset.groupId!==_drag.gid){
      document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
      c.classList.add('drag-over');
    }
  });
  grid.addEventListener('dragleave',e=>{ const c=e.target.closest('.group-card'); if(c) c.classList.remove('drag-over'); });
  grid.addEventListener('drop',e=>{
    e.preventDefault();
    const target=e.target.closest('.group-card');
    if(!target||!_drag||_drag.pid!==pageId) return;
    const tid=target.dataset.groupId; if(tid===_drag.gid) return;
    const page=state.pages.find(p=>p.id===pageId); if(!page) return;
    const si=page.groups.findIndex(g=>g.id===_drag.gid);
    const ti=page.groups.findIndex(g=>g.id===tid);
    if(si<0||ti<0) return;
    const arr=[...page.groups]; const [m]=arr.splice(si,1); arr.splice(ti,0,m);
    page.groups=arr; saveState();
    grid.innerHTML='';
    page.groups.forEach(g=>grid.appendChild(buildGroupCard(g,pageId)));
    applyEditorCSS();
  });
}

/* ══════════════════════════════════════════
   WALL PRINT — RENDER
══════════════════════════════════════════ */

/**
 * Collect every group across all editor pages.
 * Pack them into wall-pages, respecting itemsPerPage limit.
 * If a group is too big, split it across multiple wall-pages with "lanjutan" label.
 */
function renderWall(){
  const container = document.getElementById('wall-pages');
  if(!container) return;
  container.innerHTML='';

  // Flatten all groups
  const allGroups=[];
  state.pages.forEach(p=>p.groups.forEach(g=>{
    if(g.items.length>0||g.name.trim()) allGroups.push(g);
  }));

  if(!allGroups.length){
    container.innerHTML=`<div class="empty-state" style="padding:60px 20px;text-align:center;color:#888">
      <div style="font-size:28px;margin-bottom:10px">✦</div>
      <div>Tidak ada data. Tambah item di mode Editor dulu.</div>
    </div>`;
    return;
  }

  const maxSub = Math.max(1, state.itemsPerPage);

  // Build "chunks" = {group, from, to, isFirst}
  // A chunk is a portion of a group that fits on one wall page
  // We accumulate chunks until subCount > maxSub, then flush
  const wallPages=[];  // each: array of chunks
  let curPage=[], curCount=0;

  function flush(){ if(curPage.length){ wallPages.push(curPage); curPage=[]; curCount=0; } }

  allGroups.forEach(group=>{
    const items=group.items;
    const total=items.length;

    if(total===0){
      // empty group — takes 1 "slot"
      if(curCount+1>maxSub&&curPage.length) flush();
      curPage.push({group,from:0,to:0,isFirst:true});
      curCount+=1;
      return;
    }

    let from=0;
    let isFirst=true;

    while(from<total){
      const remaining=maxSub-curCount;
      if(remaining<=0){ flush(); }

      const space=maxSub-curCount;
      const take=Math.min(space, total-from);
      const to=from+take;

      curPage.push({group,from,to,isFirst});
      curCount+=take;
      isFirst=false;
      from=to;

      if(curCount>=maxSub&&from<total) flush();
    }
  });
  flush();

  const total=wallPages.length;
  wallPages.forEach((chunks,pi)=>container.appendChild(buildWallPage(chunks,pi+1,total)));
}

/* Global index of a group (for numbering) */
function groupGlobalIdx(gid){
  let n=0;
  for(const p of state.pages){
    for(const g of p.groups){ if(g.id===gid) return n; n++; }
  }
  return 0;
}

function buildWallPage(chunks, pageNum, totalPages){
  const page=document.createElement('div');
  page.className='wall-page';

  /* ── header — simple centered title ── */
  const hdr=document.createElement('div');
  hdr.className='wall-page-header';
  hdr.innerHTML=`<div class="wall-page-title">${esc(state.docTitle||'TODO')}</div>`;
  page.appendChild(hdr);

  /* ── body ── */
  const body=document.createElement('div');
  body.className='wall-page-body';

  chunks.forEach(({group,from,to,isFirst})=>{
    const block=document.createElement('div');
    block.className='wall-main-item';

    /* group title row — large checkbox + bold title */
    const titleRow=document.createElement('div');
    titleRow.className='wall-main-title';
    const allDone = group.items.length>0 && group.items.every(i=>i.done);
    titleRow.innerHTML=`
      <div class="wall-check wall-check-lg${allDone?' is-done':''}"></div>
      <span class="wall-main-label">${esc(group.name||'Untitled')}</span>`;
    block.appendChild(titleRow);

    /* sub items — indented */
    const subList=document.createElement('div');
    subList.className='wall-sub-list';

    if(group.items.length===0){
      subList.innerHTML=`<div class="wall-sub-item wall-sub-empty">
        <div class="wall-check wall-check-sm"></div>
        <div class="wall-sub-text" style="opacity:.35;font-style:italic">Belum ada item</div>
      </div>`;
    } else {
      group.items.slice(from,to).forEach(item=>{
        const row=document.createElement('div');
        row.className='wall-sub-item';
        row.innerHTML=`
          <div class="wall-check wall-check-sm${item.done?' is-done':''}"></div>
          <div class="wall-sub-text${item.done?' is-done':''}">${esc(item.text)}</div>`;
        subList.appendChild(row);
      });
    }

    block.appendChild(subList);
    body.appendChild(block);
  });

  page.appendChild(body);
  return page;
}

/* ══════════════════════════════════════════
   THEME
══════════════════════════════════════════ */
function applyWallTheme(theme){
  const view=document.getElementById('wall-view');
  if(!view) return;
  view.classList.remove('wall-light','wall-gray','wall-dark');
  view.classList.add('wall-'+(theme||'light'));
}

/* ══════════════════════════════════════════
   MODE SWITCH
══════════════════════════════════════════ */
function switchMode(mode){
  state.mode=mode;
  document.body.className='mode-'+mode;

  const editorView = document.getElementById('editor-view');
  const wallView   = document.getElementById('wall-view');

  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));

  // settings sections
  const eSet=document.getElementById('editor-settings');
  const wSet=document.getElementById('wall-settings');

  if(mode==='editor'){
    if(editorView) editorView.classList.remove('hidden');
    if(wallView)   wallView.classList.add('hidden');
    if(eSet) eSet.style.display='';
    if(wSet) wSet.style.display='none';
    renderEditor();
  } else {
    if(editorView) editorView.classList.add('hidden');
    if(wallView)   wallView.classList.remove('hidden');
    if(eSet) eSet.style.display='none';
    if(wSet) wSet.style.display='';
    applyWallTheme(state.wallTheme);
    renderWall();
  }
  saveState();
}

/* ══════════════════════════════════════════
   SETTINGS INIT
══════════════════════════════════════════ */
function initSettings(){
  /* open/close */
  const panel   = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');
  const closeBtn= document.getElementById('settings-close');

  document.getElementById('btn-settings').addEventListener('click',()=>{
    panel.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  });
  closeBtn.addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);

  /* doc title */
  const dtEl=document.getElementById('doc-title');
  dtEl.addEventListener('input',()=>{ state.docTitle=dtEl.value; saveState(); if(state.mode==='wall') renderWall(); });

  /* doc subtitle */
  const dsEl=document.getElementById('doc-subtitle');
  dsEl.addEventListener('input',()=>{ state.docSubtitle=dsEl.value; saveState(); if(state.mode==='wall') renderWall(); });

  /* accent color */
  wireColorPair('color-accent-text','color-accent-picker','csw-accent', v=>{
    state.accentColor=v; document.documentElement.style.setProperty('--accent',v); saveState();
  }, state.accentColor);

  /* header color */
  wireColorPair('color-header-text','color-header-picker','csw-header', v=>{
    state.headerColor=v; document.documentElement.style.setProperty('--header-bg',v); saveState();
  }, state.headerColor);

  /* col layout */
  document.querySelectorAll('[name="col-layout"]').forEach(r=>{
    r.checked=(r.value===state.colLayout);
    r.addEventListener('change',()=>{
      state.colLayout=r.value;
      document.querySelectorAll('.groups-grid').forEach(g=>g.classList.toggle('cols-2',r.value==='2'));
      saveState();
    });
  });

  /* font size */
  wireRange('font-size-range','font-size-label', v=>{
    state.itemFontSize=v; document.documentElement.style.setProperty('--item-fs',v+'px'); saveState();
  }, state.itemFontSize, v=>v+'px');

  /* show progress */
  const pgEl=document.getElementById('show-progress');
  pgEl.checked=state.showProgress;
  pgEl.addEventListener('change',()=>{ state.showProgress=pgEl.checked; saveState(); renderEditor(); });

  /* wall theme */
  document.querySelectorAll('[name="wall-theme"]').forEach(r=>{
    r.checked=(r.value===state.wallTheme);
    r.addEventListener('change',()=>{
      state.wallTheme=r.value;
      applyWallTheme(r.value);
      if(state.mode==='wall') renderWall();
      saveState();
    });
  });

  /* items per page */
  wireRange('items-per-page','ipp-label', v=>{
    state.itemsPerPage=v; if(state.mode==='wall') renderWall(); saveState();
  }, state.itemsPerPage, v=>String(v));
}

function closeSettings(){
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('settings-overlay').classList.add('hidden');
}

function wireColorPair(textId, pickerId, swatchId, onChange, initial){
  const t=document.getElementById(textId);
  const p=document.getElementById(pickerId);
  const s=document.getElementById(swatchId);
  if(!t||!p||!s) return;
  t.value=initial; p.value=initial; s.style.background=initial;
  p.addEventListener('input',()=>{ const v=p.value.toUpperCase(); t.value=v; s.style.background=v; onChange(v); });
  t.addEventListener('input',()=>{
    const v=t.value.trim();
    if(/^#[0-9A-Fa-f]{6}$/.test(v)){ p.value=v; s.style.background=v; onChange(v.toUpperCase()); }
  });
}

function wireRange(rangeId, labelId, onChange, initial, fmt){
  const r=document.getElementById(rangeId);
  const l=document.getElementById(labelId);
  if(!r||!l) return;
  r.value=initial; l.textContent=fmt(initial);
  r.addEventListener('input',()=>{ const v=parseInt(r.value); l.textContent=fmt(v); onChange(v); });
}

/* ══════════════════════════════════════════
   DEFAULT DATA
══════════════════════════════════════════ */
function loadDefaultData(){
  state.pages=[
    {
      id:uid(), title:'Web Docflow',
      groups:[
        { id:uid(), name:'Selesaikan Web Docflow', items:[
          {id:uid(),text:'Perbaiki Tampilan preview History',done:false,priority:'urgent',tag:''},
          {id:uid(),text:'Menambah detail kecil di mode manual, history, dan setting',done:false,priority:'important',tag:''},
          {id:uid(),text:'Memasukan Fitur Download PDF',done:false,priority:'urgent',tag:'feature'},
        ]},
      ]
    },
    {
      id:uid(), title:'Web Memories',
      groups:[
        { id:uid(), name:'Update Web Memories', items:[
          {id:uid(),text:'Menambahkan Web Memories Generator',done:false,priority:'important',tag:''},
          {id:uid(),text:'Music player menjadi floating bottom + mode icon',done:false,priority:'leisure',tag:'UI'},
          {id:uid(),text:'Tambahkan 1 atau 2 column view, dan color picker',done:false,priority:'leisure',tag:'feature'},
        ]},
      ]
    },
    {
      id:uid(), title:'Web Zanxa Site',
      groups:[
        { id:uid(), name:'Update Web Zanxa Site', items:[
          {id:uid(),text:'Menambahkan Data Real (ig, wa, maps)',done:false,priority:'urgent',tag:'content'},
          {id:uid(),text:'Update Tampilannya (Menambah Elemen di header, dll)',done:false,priority:'important',tag:'UI'},
          {id:uid(),text:'Menggunakan Foto Real untuk proyek dan komentar',done:false,priority:'urgent',tag:'content'},
          {id:uid(),text:'Perbaiki Layout nya',done:false,priority:'important',tag:'UI'},
          {id:uid(),text:'Tambahkan halaman lain selain index.html',done:false,priority:'moderate',tag:'feature'},
          {id:uid(),text:'Memasukan Desain Real ke Halaman Design',done:false,priority:'leisure',tag:'UI'},
          {id:uid(),text:'Buat Pricelist untuk Web dan Design',done:false,priority:'moderate',tag:'feature'},
          {id:uid(),text:'Tambahkan Blog nyata — minimal 3, dan ada di home',done:false,priority:'moderate',tag:'content'},
        ]},
      ]
    },
    {
      id:uid(), title:'Web Undangan Digital',
      groups:[
        { id:uid(), name:'Buat Web Undangan Digital', items:[
          {id:uid(),text:'Buat Homepage nya',done:false,priority:'urgent',tag:''},
          {id:uid(),text:'Buat Template Pertama',done:false,priority:'urgent',tag:''},
          {id:uid(),text:'Buat Generator nya',done:false,priority:'important',tag:'feature'},
          {id:uid(),text:'Pelajari "Burst Send" (Optional)',done:false,priority:'leisure',tag:'research'},
        ]},
      ]
    },
  ];
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  // Clear old storage keys that might be corrupt
  ['taskflow_state_v2','taskflow_v3'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });

  const hasData = loadSaved();
  if(!hasData) loadDefaultData();

  initSettings();

  // Sync input values from state
  const dtEl=document.getElementById('doc-title');
  const dsEl=document.getElementById('doc-subtitle');
  if(dtEl) dtEl.value=state.docTitle||'TODO LIST';
  if(dsEl) dsEl.value=state.docSubtitle||'';

  // Mode switch
  document.querySelectorAll('.mode-btn').forEach(btn=>{
    btn.addEventListener('click',()=>switchMode(btn.dataset.mode));
  });

  // Toolbar
  document.getElementById('btn-add-page').addEventListener('click', addPage);
  document.getElementById('btn-add-group').addEventListener('click',()=>{
    if(!state.pages.length){ addPage(); return; }
    addGroup(state.pages[state.pages.length-1].id);
  });

  // Print
  document.getElementById('btn-print').addEventListener('click',()=>window.print());
  document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key==='p'){ e.preventDefault(); window.print(); } });

  // Apply CSS vars
  document.documentElement.style.setProperty('--accent',    state.accentColor);
  document.documentElement.style.setProperty('--header-bg', state.headerColor);
  document.documentElement.style.setProperty('--item-fs',   state.itemFontSize+'px');

  // Sync range/radio initial values
  const ipp=document.getElementById('items-per-page');
  const ippl=document.getElementById('ipp-label');
  if(ipp)  ipp.value=state.itemsPerPage;
  if(ippl) ippl.textContent=state.itemsPerPage;

  const fsr=document.getElementById('font-size-range');
  const fsl=document.getElementById('font-size-label');
  if(fsr)  fsr.value=state.itemFontSize;
  if(fsl)  fsl.textContent=state.itemFontSize+'px';

  document.querySelectorAll('[name="col-layout"]').forEach(r=>{ r.checked=r.value===state.colLayout; });
  document.querySelectorAll('[name="wall-theme"]').forEach(r=>{ r.checked=r.value===state.wallTheme; });

  // Initial render — always start in editor to avoid flash
  switchMode('editor');

  toast('✦ Taskflow siap. Klik "Wall Print" untuk mode cetak tempel.');
});
