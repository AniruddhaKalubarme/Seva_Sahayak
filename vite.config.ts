import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to copy extension folder
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
  base: "/Seva_Sahayak/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    copyExtensionPlugin,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
