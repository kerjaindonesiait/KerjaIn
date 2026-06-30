import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@vis.gl') || id.includes('@googlemaps') || id.includes('google.maps')) {
            return 'google-maps';
          }
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
          if (id.includes('@radix-ui') || id.includes('@mui') || id.includes('@emotion')) {
            return 'ui-vendor';
          }
          return 'vendor';
        },
      },
    },
  },

  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    {
      name: 'font-display-optional',
      transform(code, id) {
        if (id.includes('@fontsource/manrope') && id.endsWith('.css')) {
          return code.replace(/font-display:\s*swap/g, 'font-display: optional');
        }
      },
      generateBundle(_options, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
            chunk.source = String(chunk.source).replace(
              /font-display:\s*swap/g,
              'font-display: optional',
            );
          }
        }
      },
    },
    {
      name: 'preload-hero-font',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          const bundle = ctx.bundle;
          if (!bundle) return html;

          const fontFile = Object.keys(bundle).find((file) =>
            /manrope-latin-700-normal-.*\.woff2$/.test(file),
          );
          if (!fontFile) return html;

          const preload = `  <link rel="preload" href="/${fontFile}" as="font" type="font/woff2" crossorigin />\n`;
          return html.replace('</head>', `${preload}</head>`);
        },
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
