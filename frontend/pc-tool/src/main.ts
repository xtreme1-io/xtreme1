import { createApp, DefineComponent } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.dark.css';

import Vue3ColorPicker from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';

import './style/index.less';

import App from './App.vue';

export function init(App: DefineComponent<{}, {}, any>) {
    const app = createApp(App);
    app.use(Antd);
    app.use(Vue3ColorPicker);

    app.mount('#app');
}

init(App);
