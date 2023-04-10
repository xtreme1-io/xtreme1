import '/@/design/index.less';
import 'virtual:windi-base.css';
import 'virtual:windi-components.css';
import 'virtual:windi-utilities.css';
// Register icon sprite
import 'virtual:svg-icons-register';
import App from './App.vue';
import { createApp } from 'vue';
import { initAppConfigStore } from '/@/logics/initAppConfig';
import { setupErrorHandle } from '/@/logics/error-handle';
import { router, setupRouter } from '/@/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import { setupGlobDirectives } from '/@/directives';
import { setupI18n } from '/@/locales/setupI18n';
import { registerGlobComp } from '/@/components/registerGlobComp';
import V3ColorPicker, { directive } from 'v3-color-picker';
import VueLazyLoad from 'vue3-lazyload';
import placeImg from '/@/assets/images/placeImg.png';
import { setupLazyLoadDirective } from './directives/lazy';

import JsonViewer from 'vue3-json-viewer';
//添加样式
import 'vue3-json-viewer/dist/index.css';

// Importing on demand in local development will increase the number of browser requests by around 20%.
// This may slow down the browser refresh speed.
// Therefore, only enable on-demand importing in production environments .
if (import.meta.env.DEV) {
  import('ant-design-vue/dist/antd.less');
}

// const apolloProvider = createApolloProvider({
//   defaultClient: apolloClient,
// });

async function bootstrap() {
  const app = createApp(App);
  app.use(JsonViewer);
  // app.use(apolloProvider);

  app.use(V3ColorPicker);
  app.use(VueLazyLoad, {
    loading: placeImg,
    // options...
  });
  app.directive('color-picker', directive);
  setupLazyLoadDirective(app);

  // Configure store
  setupStore(app);

  // Initialize internal system configuration
  initAppConfigStore();

  // Register global components
  registerGlobComp(app);

  // Multilingual configuration
  // Asynchronous case: language files may be obtained from the server side
  await setupI18n(app);

  // Configure routing
  setupRouter(app);

  // router-guard
  setupRouterGuard(router);

  // Register global directive
  setupGlobDirectives(app);

  // Configure global error handling
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.mount('#app');
}

bootstrap();
