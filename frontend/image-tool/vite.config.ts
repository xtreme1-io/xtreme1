const { defineConfig, mergeConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');
const fs = require('fs');

let localConfig = getLocalConfig();

const config = defineConfig({
    server: {
        open: true,
        port: 3300,
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'http://localhost:8190',
            },
        },
    },
    plugins: [vue()],
    alias: [
        { find: 'editor', replacement: path.resolve(__dirname, './src/editor') },
        { find: 'business', replacement: path.resolve(__dirname, './src/business/chengdu') },
        { find: /^editor/, replacement: path.resolve(__dirname, './src/editor') },
        { find: /^\/@\//, replacement: path.resolve(__dirname, './src/') + '/' },
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
