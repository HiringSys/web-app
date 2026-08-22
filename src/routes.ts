import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/access',
      component: () => import('@/views/access/AccessView.vue'),
      children: [
        {
          path: '/login',
          name: 'login',
          component: () => import('@/views/access/LoginFragment.vue'),
        },
        {
          path: '/recuperar-senha',
          name: 'recuperar-senha',
          component: () => import('@/views/access/ForgetPasswordFragment.vue'),
        },
      ],
    },
    {
      path: '/tests',
      name: 'tests',
      component: () => import('@/views/TestsView.vue'),
    },
    {
      path: '/candidatos',
      name: 'candidatos',
      component: () => import('@/views/CandidatesView.vue'),
    },
    {
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/PeneirasView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
