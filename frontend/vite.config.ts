import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "frontend",
  plugins: [react(), tailwindcss()],
  base:
    process.env.GITHUB_ACTIONS === "true"
      ? "/0x8Acure/app/"
      : process.env.VERCEL === "1"
        ? "/"
        : process.env.NODE_ENV === "production"
          ? "/app/"
          : "/",
  build: { outDir: "../public/app", emptyOutDir: true },
  server: {
    port: 5173,
    strictPort: true,
    fs: { allow: [process.cwd()] },
    proxy: { "/api": "http://localhost:8080" }
  }
});
