import { createApp } from 'vue'
import './index.css'

import App    from './App.vue'
import router from './routes.ts'
import { notify } from '@@/feedback/notify'
import { AUTH_EXPIRED_EVENT } from '@/service/api'

window.addEventListener(AUTH_EXPIRED_EVENT, () => {
  void router.replace({ name: 'login' }).then(() => {
    notify('Sua sessão expirou. Faça login novamente para continuar.', 'warning', 5000)
  })
})

createApp(App).use(router).mount('#app')
