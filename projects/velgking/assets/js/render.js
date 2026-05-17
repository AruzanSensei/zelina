// ─── RENDER PRODUCT CARD ───
function renderProductCard(p, showDetail = true) {
    return `
    <div class="product-card" onclick="${showDetail ? `openDetail(${p.id})` : ''}">
      <div class="product-img-wrap">
        <span class="wheel-icon">${p.icon}</span>
        ${p.badge ? `<div class="badge badge-red">${p.badge}</div>` : ''}
        ${!p.stock ? `<div class="badge badge-dark" style="top:auto;bottom:0.8rem">Indent</div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-specs">${p.size} | PCD ${p.pcd} | ${p.color}</div>
        <div class="product-price">${p.price} <span class="per">/ pcs</span></div>
        <div class="product-actions">
          <button class="btn btn-outline" onclick="event.stopPropagation();openDetail(${p.id})">Detail</button>
          <button class="btn btn-wa" onclick="event.stopPropagation();openWA()"><i class="fab fa-whatsapp"></i></button>
        </div>
      </div>
    </div>`;
}

// ─── RENDER TESTIMONIAL CARD ───
function renderTesti(t) {
    const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
    const initial = t.name[0];
    return `
    <div class="testi-card">
      <div class="testi-stars">${stars}</div>
      <div class="testi-text">${t.comment}</div>
      <div class="testi-user">
        <div class="testi-avatar">${initial}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-city"><i class="fas fa-map-marker-alt" style="font-size:0.7rem"></i> ${t.city}</div>
          <div class="testi-velg">${t.velg}</div>
        </div>
      </div>
    </div>`;
}
