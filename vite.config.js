import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: 'src/content.js',
        background: 'src/background.js', // if needed
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});
