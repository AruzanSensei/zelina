/**
 * Cloudflare Worker — QR Zanxa Product Router
 * 
 * Handles dynamic routing for GitHub Pages
 * which doesn't support clean URL paths.
 * 
 * Routes:
 *   /product/{ID}  →  /product.html?id={ID}
 *   /* (all else)  →  passthrough to origin
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Route: /product/{ID}
    if (url.pathname.startsWith("/product/")) {
      const id = url.pathname.split("/product/")[1];

      // Strip trailing slash if present
      const cleanId = id.replace(/\/$/, "");

      if (cleanId) {
        return Response.redirect(
          `${url.origin}/product.html?id=${encodeURIComponent(cleanId)}`,
          302
        );
      }

      // /product/ with no ID → redirect to home
      return Response.redirect(`${url.origin}/`, 302);
    }

    // All other routes: passthrough to GitHub Pages origin
    return fetch(request);
  }
};
