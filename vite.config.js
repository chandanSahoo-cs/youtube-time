import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/popup/*',   // Source path of your HTML files
          dest: 'popup'         // Destination folder in dist
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        content: 'src/scripts/content.js',
        background: 'src/scripts/background.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});