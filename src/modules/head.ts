import { createHead } from '@vueuse/head'

import type { UserModule } from '@/UserModule'

export const install: UserModule = ({ app }) => {
  const head = createHead()
  app.use(head)
}
