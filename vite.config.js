import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://rento-lb.com", // <-- replace with your domain
    }),
  ],
  server: {
    port: 3000,
    host: "localhost",
    strictPort: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
