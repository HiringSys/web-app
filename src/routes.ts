import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Peneiras' }
    },
    {
      path: '/access',
      component: () => import('@/views/access/AccessView.vue'),
      children: [
        {
          path: '/login',
          name: 'login',
          component: () => import('@/views/access/LoginFragment.vue'),
          meta: { title: 'Login' }
        },
        {
          path: '/recuperar-senha',
          name: 'recuperar-senha',
          component: () => import('@/views/access/ForgetPasswordFragment.vue'),
          meta: { title: 'Recuperar senha' }
        },
      ],
    },
    {
      path: '/tests',
      name: 'tests',
      component: () => import('@/views/TestsView.vue'),
      meta: { title: 'Testes' }
    },
    {
      path: '/candidatos',
      name: 'candidatos',
      component: () => import('@/views/CandidatesView.vue'),
      meta: { title: 'Candidatos' }
    },
    {
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/PeneirasView.vue'),
      meta: { title: 'Peneiras' }
    },
    {
      path: '/peneiras/:id',
      name: 'peneira-filtragem',
      component: () => import('@/views/FiltragemView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Opss....' }
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title as string
})

export default router
