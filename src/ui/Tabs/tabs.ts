import { RouteLocationRaw } from 'vue-router'

export interface NatTab {
  id: string
  to?: RouteLocationRaw
  exactRouteMatch?: boolean
  name: string
  icon?: any
  component?: any
  componentProps?: Record<string, any>
  disabled?: boolean
}
