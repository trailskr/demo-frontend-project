import NProgress from 'nprogress'

import type { UserModule } from '@/UserModule'

export const install: UserModule = ({ router }) => {
  if (import.meta.env.SSR) return
  router.beforeEach((to, from) => {
    if (to.path !== from.path) {
      NProgress.start()
    }
  })
  router.afterEach(() => { NProgress.done() })
}
