import { createApp, DefineComponent } from 'vue';
import { Router } from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';
// import 'ant-design-vue/dist/antd.dark.css';
// import Icons from '@basicai/icons';
import { setupI18n } from './lang';

import './style/index.less';
import { createPinia } from 'pinia';
import { useProvideBSEditor } from './business/chengduNew/context';

export async function init(App: DefineComponent<{}, {}, any>, router?: Router) {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(VueClipboard);
  app.use(Antd);
  // app.use(Icons);
  app.use(pinia);

  if (router) app.use(router);
  setupI18n(app);
  useProvideBSEditor(app);

  app.mount('#app');
}
