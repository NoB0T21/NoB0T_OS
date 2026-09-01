import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    }
  },

  preview: {
    host: "0.0.0.0",
    port: 8080
  },

  plugins: [tailwindcss(), react()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});