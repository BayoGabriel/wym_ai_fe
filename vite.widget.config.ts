import { defineConfig } from 'vite';

// Standalone embeddable bundle: a single self-contained IIFE with no React or
// app dependencies, so it can be dropped onto any client website.
export default defineConfig({
  build: {
    outDir: 'dist-widget',
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: 'src/widget/widget.ts',
      name: 'WymAssist',
      formats: ['iife'],
      fileName: () => 'wymassist.js',
    },
  },
});
