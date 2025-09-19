import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Bundle analyzer для анализа размера бандла
    mode === "production" && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon.png'],
      manifest: {
        name: 'Wrocław Tumski Island Virtual Tour',
        short_name: 'Tumski Tour',
        description: 'Interactive virtual tour of Tumski Island in Wrocław, Poland',
        theme_color: '#1a1a1a',
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'any',
        icons: [
          {
            src: 'icons/icon-512x512.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,avif,svg,mp3,wav,json}'],
        maximumFileSizeToCacheInBytes: 50000000, // 50MB for large panorama images
        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Panorama Images - High Priority
          {
            urlPattern: /\/images\/panoramas\/.+\.(png|jpg|jpeg|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'panorama-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Other Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|avif|svg|gif)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // Audio Files
          {
            urlPattern: /\/audio\/.+\.(mp3|wav|ogg|m4a)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Localization Files
          {
            urlPattern: /\/locales\/.+\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'locales-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // API Calls (if any)
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        // Custom navigation fallback
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Оптимизация сборки
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        // Разделение кода на чанки
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slider'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          audio: ['zustand'],
        },
        // Оптимизация имен файлов
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Увеличиваем лимит для больших изображений
    chunkSizeWarningLimit: 1000,
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'react-i18next',
      'zustand',
    ],
    exclude: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
}));
