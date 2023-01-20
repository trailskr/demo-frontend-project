import { AlertSemantics } from '@/ui/Alert/alert'

export interface Notification {
  message: string
  duration?: number
  semantics?: AlertSemantics
}
