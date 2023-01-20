import { createI18n } from 'vue-i18n'

import type { UserModule } from '@/UserModule'
import { detectAllowedLocale, AllowedLocale } from '@/i18n/locales'

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
const messages = Object.fromEntries(
  Object.entries(
    import.meta.glob('../../locales/*.y(a)?ml', { eager: true }))
    .map(([key, value]: [key: string, module: any]) => {
      const yaml = key.endsWith('.yaml')
      return [key.slice(14, yaml ? -5 : -4), value.default]
    })
)

export const install: UserModule = ({ app, ssrContext }) => {
  let locale: AllowedLocale
  if (import.meta.env.SSR) {
    if (!ssrContext) throw new Error('no ssrContext provided')
    const languages = ssrContext.req.headers['accept-language']
    locale = detectAllowedLocale(languages)
  } else {
    locale = detectAllowedLocale(navigator.language)
  }

  const i18n = createI18n({
    legacy: false,
    locale,
    messages
  })

  app.use(i18n)
}
