import { createRouter, createWebHistory } from 'vue-router'
import ProcessesView from '@/views/core/ProcessesView.vue'
import { getAuthToken } from '@/service/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ProcessesView,
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
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/core/ProcessesView.vue'),
      meta: { title: 'Peneiras' }
    },
    {
      path: '/peneiras/:id',
      name: 'peneira-filtragem',
      component: () => import('@/views/core/ProcessDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Opss....' }
    },
  ],
})

// Routes reachable without a session — everything else requires auth.
const PUBLIC_ROUTES = new Set(['login', 'recuperar-senha'])

router.beforeEach((to) => {
  const isAuthenticated = !!getAuthToken()
  const isPublic = PUBLIC_ROUTES.has(to.name as string)

  if (!isAuthenticated && !isPublic) {
    return { name: 'login' }
  }

  if (isAuthenticated && isPublic) {
    return { name: 'peneiras' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title as string
})

export default router
