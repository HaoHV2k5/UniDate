// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ----- ADDED -----
  // Make "global" available in the browser (replace global -> window)
  define: {
    global: "window",
  },

  // Optional: force pre-bundling / cjs handling for libs that expect node-like env
  optimizeDeps: {
    include: [
      // add sockjs-client if you're using it (helps Vite pre-bundle it correctly)
      "sockjs-client",
      // sometimes stompjs needs pre-bundling too (uncomment if necessary)
      // "@stomp/stompjs"
    ],
  },

  // Optional: if you still see packages using CommonJS features, relax commonjs options
  // (only enable if you see ESM/CommonJS related runtime errors)
  // build: {
  //   commonjsOptions: {
  //     transformMixedEsModules: true
  //   }
  // }
}));
