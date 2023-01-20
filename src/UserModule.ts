import { App } from 'vue'
import { Router } from 'vue-router'

import { SSRContextVite } from './ssr/server'

export interface UserModuleParams {
  readonly app: App
  readonly router: Router
  readonly ssrContext?: SSRContextVite
  readonly initialState: Record<string | symbol, any>
}

export type UserModule = (params: UserModuleParams) => void
