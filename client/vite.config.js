import { createHash } from "node:crypto";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api is proxied to the ASP.NET backend. For a separate deployment set VITE_API_BASE_URL.
// loadEnv lets API_PROXY_TARGET come from client/.env.local as well as from the shell.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), contentSecurityPolicy(env.VITE_API_BASE_URL)],
    base: "./",
    server: {
      proxy: { "/api": env.API_PROXY_TARGET || "http://localhost:5080" },
    },
  };
});

/**
 * Adds a Content-Security-Policy <meta> to the built index.html: scripts and styles only from the site
 * (the inline theme script is allowed by its hash), fonts from Google Fonts, fetch only to the site and
 * the API. It is written at build time because vercel.json can't read VITE_API_BASE_URL.
 */
function contentSecurityPolicy(apiBase) {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const scriptHashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
          .map(([, code]) => `'sha256-${createHash("sha256").update(code).digest("base64")}'`);
        const api = apiBase ? ` ${new URL(apiBase).origin}` : "";
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${scriptHashes.join(" ")}`,
          "style-src 'self' https://fonts.googleapis.com",
          "font-src https://fonts.gstatic.com",
          `connect-src 'self'${api}`,
          "img-src 'self' data:",
          "object-src 'none'",
          "base-uri 'none'",
          "form-action 'none'",
        ].join("; ");
        const charset = /<meta charset="[^"]*">/i;
        if (!charset.test(html)) throw new Error("index.html needs <meta charset> to place the CSP after it.");
        return html.replace(charset, (tag) => `${tag}\n    <meta http-equiv="Content-Security-Policy" content="${policy}">`);
      },
    },
  };
}
