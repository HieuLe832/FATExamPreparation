import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api is proxied to the ASP.NET backend. For a separate deployment set VITE_API_BASE_URL.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: { "/api": process.env.API_PROXY_TARGET ?? "http://localhost:5080" },
  },
});
