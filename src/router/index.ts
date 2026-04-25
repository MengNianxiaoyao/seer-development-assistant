import { createRouter, createWebHistory } from 'vue-router'
import AnalyzePage from '@/components/pages/AnalyzePage.vue'
import ConvertPage from '@/components/pages/ConvertPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/analyze',
    },
    {
      path: '/analyze',
      name: 'analyze',
      component: AnalyzePage,
    },
    {
      path: '/convert',
      name: 'convert',
      component: ConvertPage,
    },
  ],
})

export default router
