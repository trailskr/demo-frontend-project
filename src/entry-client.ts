/* eslint-disable import/order */
import '@unocss/reset/tailwind.css'
import '@/styles/main.css'
import 'uno.css'

import { initApp } from '@/initApp'
import { makeRouter } from '@/router/makeRouter'
// import { mockApi } from '@/api/apiMocks'

import Main from '@/Main.vue'

const app = createApp(Main) // createSSRApp(Main)
const router = makeRouter()
app.use(router)
initApp({ app, router, initialState: window.__INITIAL_STATE__ ?? {} })

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  // mockApi()
  app.mount('#app')
})
