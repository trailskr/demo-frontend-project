import { QueryClient, hydrate, dehydrate, VUE_QUERY_CLIENT } from 'vue-query'

import type { UserModule } from '@/UserModule'

export const install: UserModule = ({ app, initialState }) => {
  const client = new QueryClient()
  if (import.meta.env.SSR) {
    initialState.vueQueryState = { toJSON: () => dehydrate(client) }
  } else {
    hydrate(client, initialState.vueQueryState)
  }

  client.mount()
  app.provide(VUE_QUERY_CLIENT, client)
}
