import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        https: true, // Enable HTTPS for the dev server if needed
    },
    build: {
        // Ensure asset paths are correct
        outDir: 'public/build',
    },
    base: process.env.APP_URL || '/', // Use APP_URL from the environment for asset generation
});
