// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// Плагины
import { VitePWA } from 'vite-plugin-pwa';
import { checker } from 'vite-plugin-checker';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ command, mode }) => {
    // Загружаем переменные окружения
    const env = loadEnv(mode, process.cwd(), '');
    const isDev = command === 'serve';
    const isProd = command === 'build';
    const isAnalyze = env.ANALYZE === 'true';

    return {
        // Основные настройки
        root: process.cwd(),
        base: env.VITE_BASE_URL || '/',
        publicDir: 'public',

        // Настройка плагинов
        plugins: [
            // React с SWC для быстрой компиляции
            react({
                jsxImportSource: '@emotion/react',
                babel: {
                    plugins: isDev ? ['@emotion/babel-plugin'] : []
                }
            }),

            // TypeScript проверки в dev режиме
            isDev && checker({
                typescript: {
                    tsconfigPath: './tsconfig.json'
                },
                eslint: {
                    lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
                    dev: {
                        logLevel: ['error', 'warning']
                    }
                },
                overlay: {
                    initialIsOpen: false,
                    position: 'tl'
                }
            }),

            // PWA поддержка
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
                manifest: {
                    name: 'IP Roast Enterprise',
                    short_name: 'IP Roast',
                    description: 'Enterprise Network Security Assessment Platform',
                    theme_color: '#1e293b',
                    background_color: '#0f172a',
                    display: 'standalone',
                    orientation: 'portrait',
                    scope: '/',
                    start_url: '/',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/api\./i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24 // 24 часа
                                }
                            }
                        }
                    ]
                }
            }),

            // Сжатие для production
            isProd && compression({
                algorithm: 'gzip',
                exclude: [/\.br$/, /\.gz$/]
            }),

            // Brotli сжатие
            isProd && compression({
                algorithm: 'brotliCompress',
                exclude: [/\.br$/, /\.gz$/]
            }),

            // Legacy браузеры поддержка
            isProd && legacy({
                targets: ['> 1%', 'last 2 versions', 'not dead', 'not ie 11'],
                additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
                renderLegacyChunks: true,
                polyfills: [
                    'es.symbol',
                    'es.array.filter',
                    'es.promise',
                    'es.promise.finally',
                    'es/map',
                    'es/set',
                    'es.array.for-each',
                    'es.object.define-properties',
                    'es.object.define-property',
                    'es.object.get-own-property-descriptor',
                    'es.object.get-own-property-descriptors',
                    'es.object.keys',
                    'es.object.to-string',
                    'web.dom-collections.for-each',
                    'esnext.global-this',
                    'esnext.string.match-all'
                ]
            }),

            // Анализ бундла
            isAnalyze && visualizer({
                filename: 'dist/stats.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
                template: 'treemap'
            })
        ].filter(Boolean),

        // Алиасы путей
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@components': resolve(__dirname, 'src/components'),
                '@pages': resolve(__dirname, 'src/pages'),
                '@services': resolve(__dirname, 'src/services'),
                '@stores': resolve(__dirname, 'src/stores'),
                '@types': resolve(__dirname, 'src/types'),
                '@utils': resolve(__dirname, 'src/utils'),
                '@hooks': resolve(__dirname, 'src/hooks'),
                '@styles': resolve(__dirname, 'src/styles'),
                '@assets': resolve(__dirname, 'src/assets')
            }
        },

        // CSS настройки
        css: {
            devSourcemap: isDev,
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@/styles/variables.scss";`
                }
            },
            modules: {
                localsConvention: 'camelCase',
                generateScopedName: isDev
                    ? '[name]__[local]__[hash:base64:5]'
                    : '[hash:base64:8]'
            }
        },

        // Оптимизация зависимостей
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                'chart.js',
                'socket.io-client',
                'zustand',
                'framer-motion',
                'date-fns',
                'lodash-es'
            ],
            exclude: [
                '@vite/client',
                '@vite/env'
            ],
            esbuildOptions: {
                target: 'es2020'
            }
        },

        // Настройки сервера разработки
        server: {
            host: env.VITE_HOST || 'localhost',
            port: parseInt(env.VITE_PORT || '3000'),
            open: env.VITE_OPEN === 'true',
            cors: true,
            hmr: {
                overlay: true
            },
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:5000',
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                    rewrite: (path) => path.replace(/^\/api/, '')
                },
                '/socket.io': {
                    target: env.VITE_WS_URL || 'http://localhost:5000',
                    changeOrigin: true,
                    ws: true
                }
            }
        },

        // Настройки preview
        preview: {
            host: env.VITE_PREVIEW_HOST || 'localhost',
            port: parseInt(env.VITE_PREVIEW_PORT || '3001'),
            open: env.VITE_PREVIEW_OPEN === 'true'
        },

        // Настройки сборки
        build: {
            target: 'es2020',
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: isDev || env.VITE_SOURCEMAP === 'true',
            minify: isProd ? 'esbuild' : false,
            cssMinify: isProd,
            chunkSizeWarningLimit: 1000,

            // Оптимизация сборки
            rollupOptions: {
                output: {
                    // Разделение кода
                    manualChunks: {
                        // Vendor chunks
                        react: ['react', 'react-dom'],
                        router: ['react-router-dom'],

                        // UI библиотеки
                        ui: ['framer-motion', '@headlessui/react'],

                        // Графики
                        charts: ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns'],

                        // Утилиты
                        utils: ['lodash-es', 'date-fns', 'clsx'],

                        // Состояние и API
                        state: ['zustand', 'axios', 'socket.io-client'],

                        // Специфичные для IP Roast
                        'ip-roast-core': [
                            './src/services/api.ts',
                            './src/services/scannerApi.ts',
                            './src/services/reconApi.ts'
                        ],
                        'ip-roast-stores': [
                            './src/stores/scannerStore.tsx',
                            './src/stores/notificationStore.tsx',
                            './src/stores/settingsStore.tsx',
                            './src/stores/themeStore.tsx'
                        ]
                    },

                    // Настройка именования файлов
                    entryFileNames: isDev ? '[name].js' : 'assets/[name]-[hash].js',
                    chunkFileNames: isDev ? '[name].js' : 'assets/[name]-[hash].js',
                    assetFileNames: isDev ? '[name].[ext]' : 'assets/[name]-[hash].[ext]'
                },

                // Внешние зависимости
                external: isProd ? [] : ['fsevents']
            },

            // Настройки esbuild
            esbuild: {
                drop: isProd ? ['console', 'debugger'] : [],
                legalComments: 'none'
            }
        },

        // Переменные окружения
        define: {
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
            __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
            __DEV__: isDev,
            __PROD__: isProd
        },

        // ESBuild настройки
        esbuild: {
            target: 'es2020',
            jsxInject: isDev ? undefined : `import React from 'react'`
        },

        // Настройки логирования
        logLevel: isDev ? 'info' : 'warn',

        // Очистка экрана
        clearScreen: isDev
    };
});
