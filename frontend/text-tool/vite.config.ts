const { defineConfig, mergeConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');
const fs = require('fs');

let localConfig = getLocalConfig();
// https://vitejs.dev/config/
const config = defineConfig({
    server: {
        open: true,
        port: 3200,
        // api proxy when development
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'http://localhost:8190',
            },
        },
    },
    plugins: [vue()],
    alias: [
        { find: 'pc-render', replacement: path.resolve(__dirname, './src/packages/pc-render') },
        { find: 'pc-editor', replacement: path.resolve(__dirname, './src/packages/pc-editor') },
    ],
});

module.exports = mergeConfig(config, localConfig);

function getLocalConfig() {
    let file = path.resolve(__dirname, './vite.config.local.js');
    let config = {};
    if (fs.existsSync(file)) {
        try {
            config = require(file);
        } catch (e) {}
    }
    return config;
}
