import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    { path: '/', component: () => import('/@/business/chengdu/Editor.vue') },
    // { path: '/chengdu', component: () => import('/@/business/chengdu/Editor.vue') },
    // { path: '/about', component: About },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
    // strict: true,
    // scrollBehavior: () => ({ left: 0, top: 0 }),
});
