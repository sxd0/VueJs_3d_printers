import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/printers',
      name: 'printers',
      component: () => import('../views/PrintersView.vue')
    },
    {
      path: '/plastics',
      name: 'plastics',
      component: () => import('../views/PlasticsView.vue')
    },
    {
      path: '/models',
      name: 'models',
      component: () => import('../views/ModelsView.vue')
    }
  ]
})

export default router