import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Igual que en portfolio: base = "/" + nombre del repo en GitHub + "/" (cambia si renombras el repo)
export default defineConfig({
  base: "/landing-page-de-captacion-de-talento-con-automatizaciones-n8n/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist" },
});
