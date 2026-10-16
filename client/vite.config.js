import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The production build is served by the ASP.NET host in ../server.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "../server/wwwroot", emptyOutDir: true },
});
