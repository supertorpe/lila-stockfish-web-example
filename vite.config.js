import { defineConfig } from 'vite';
import { splitVendorChunkPlugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['lila-stockfish-web/linrock-nnue-7.js'],
    }
  },
  plugins: [
    splitVendorChunkPlugin(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/lila-stockfish-web/linrock-nnue-7*',
          dest: 'assets/stockfish/'
        }
      ]
    }),
  ],
});
