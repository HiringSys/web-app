import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from '@/service/api'
import { getProcess   } from '@/service/Peneiras'
import { beginGlobalLoading } from '@@/feedback/globalLoading'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'peneiras' },
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
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/core/ProcessesView.vue'),
      meta: { title: 'Peneiras' }
    },
    {
      path: '/funcionarios',
      name: 'funcionarios',
      component: () => import('@/views/core/FuncionariosView.vue'),
      meta: { title: 'Funcionários' }
    },
    {
      path: '/peneiras/:id',
      name: 'peneira-filtragem',
      component: () => import('@/views/core/ProcessDetailView.vue'),
      
      async beforeEnter(to) {
        try {
          const peneira = await getProcess(to.params.id as string)
          to.meta.title = peneira?.jobTitle ?? 'Processo seletivo'
        } catch {
          to.meta.title = 'Processo seletivo'
        }
        return true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Opss....' }
    },
  ],
})

const PUBLIC_ROUTES = new Set(['login', 'recuperar-senha'])
let finishNavigationLoading: (() => void) | undefined

router.beforeEach((to) => {
  finishNavigationLoading?.()
  finishNavigationLoading = beginGlobalLoading('Carregando página...')

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
  document.title = (to.meta.title as string | undefined) ?? 'HiringSys'
  finishNavigationLoading?.()
  finishNavigationLoading = undefined
})

router.onError(() => {
  finishNavigationLoading?.()
  finishNavigationLoading = undefined
})

export default router
