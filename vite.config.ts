import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The browser extension is a separate deliverable, so copy it into the build
// output instead of bundling it into the React application.
const copyExtensionPlugin = {
  name: 'copy-extension',
  writeBundle(options) {
    const srcDir = path.join(__dirname, 'extension');
    const destDir = path.join(options.dir, 'extension');
    
    if (fs.existsSync(srcDir)) {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.cpSync(srcDir, destDir, { recursive: true });
      console.log('✓ Extension files copied to dist/extension');
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // This base path is required because the production app is hosted in a repository subfolder.
  base: "/Seva_Sahayak/",
  server: {
    // Allow access from the local network while developing and keep the dev port predictable.
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    copyExtensionPlugin,
  ].filter(Boolean),
  resolve: {
    alias: {
      // "@/" keeps imports independent of the importing file's folder depth.
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
