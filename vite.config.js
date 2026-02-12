<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sitemap from 'vite-plugin-sitemap';
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import sitemap from "vite-plugin-sitemap";
>>>>>>> abbas

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://rento-lb.com", // <-- replace with your domain
<<<<<<< HEAD
    })
  ],
  server: { 
    port: 5000,
    host: "127.0.0.1",
    strictPort: true
=======
    }),
  ],
  server: {
    port: 3000,
    host: "localhost",
    strictPort: true,
>>>>>>> abbas
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> abbas
