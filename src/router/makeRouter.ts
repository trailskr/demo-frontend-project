import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'

export const makeRouter = () => createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: import.meta.env.SSR
    ? createMemoryHistory()
    : createWebHistory()
})
