// Cloudflare Worker — qr.zanxa.site routing
// Deploy ini di Cloudflare Workers Dashboard

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Route: /product/{ID} → /product.html?id={ID}
    if (url.pathname.startsWith("/product/")) {
      const id = url.pathname.split("/product/")[1];

      // Pastikan ID tidak kosong
      if (!id || id.trim() === "") {
        return Response.redirect(`${url.origin}/`, 302);
      }

      return Response.redirect(
        `${url.origin}/product.html?id=${encodeURIComponent(id)}`,
        302
      );
    }

    // Semua route lain: pass-through ke GitHub Pages
    return fetch(request);
  }
};
