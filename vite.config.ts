import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default defineConfig({
	plugins: [
        sveltekit(),
        SvelteKitPWA({
            srcDir: './src',
            mode: process.env.VERCEL_ENV === 'production' ? 'production' : 'development',
            // you don't need to do this if you're using generateSW strategy in your app
            strategies: 'generateSW',
            scope: '/',
            base: '/',
            selfDestroying: process.env.SELF_DESTROYING_SW === 'true',
            manifest: {
                short_name: 'ClockIT',
                name: 'ClockIT',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                theme_color: "#ffffff",
                background_color: "#ffffff",
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            injectManifest: {
                // currently not used, therefore commented:
                // webp,woff,woff2
                globPatterns: ['client/**/*.{js,css,ico,png,svg}']
            },
            workbox: {
                // currently not used, therefore commented:
                // webp,woff,woff2
                globPatterns: ['client/**/*.{js,css,ico,png,svg}']
            },
            devOptions: {
                enabled: true,
                suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
                type: 'module',
                navigateFallback: '/',
            },
            // if you have shared info in svelte config file put in a separate module and use it also here
            kit: {}
        })
    ]
});
