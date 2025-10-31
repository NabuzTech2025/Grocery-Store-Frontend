import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const env = loadEnv(process.env.NODE_ENV, process.cwd());
let basePath = "/";
if (env.VITE_APP_BASE_ROUTE && env.VITE_APP_BASE_ROUTE.trim() !== "") {
  basePath = `/${env.VITE_APP_BASE_ROUTE}/`;
}

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
    },
  },
});
