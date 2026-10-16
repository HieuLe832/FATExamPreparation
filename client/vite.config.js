import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api is proxied to the ASP.NET backend. For a separate deployment set VITE_API_BASE_URL.
// loadEnv lets API_PROXY_TARGET come from client/.env.local as well as from the shell.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    base: "./",
    server: {
      proxy: { "/api": env.API_PROXY_TARGET || "http://localhost:5080" },
    },
  };
});
