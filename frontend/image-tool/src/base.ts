import { createApp, DefineComponent } from 'vue';
import { Router } from 'vue-router';
import VueClipboard from 'vue-clipboard2';
// import { setupI18n } from '/@/locales/setupI18n';
import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';
import 'ant-design-vue/dist/antd.dark.css';

import './style/index.less';

export async function init(App: DefineComponent<{}, {}, any>, router?: Router) {
    const app = createApp(App);
    app.use(VueClipboard);
    app.use(Antd);

    if (router) app.use(router);

    // await setupI18n(app);

    app.mount('#app');
}
