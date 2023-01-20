import type { UserModule } from '@/UserModule'

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = (/* { router } */) => {
  // if (import.meta.env.SSR) return

  // router.isReady()
  //   .then(() => import('virtual:pwa-register'))
  //   .then(({ registerSW }) => {
  //     registerSW({ immediate: true })
  //   })

  if (!navigator.serviceWorker) return
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}
