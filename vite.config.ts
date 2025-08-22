import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    global: "window",
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    port: 1102,
  },
});
