import { InjectionKey } from 'vue'

import { Notification } from './notification'

export type I18nNotify = (notification: Notification) => void
export type Notify = (notification: Notification) => void

const notifyKey: InjectionKey<I18nNotify> = Symbol('notifyKey')

export const useProvideNotify = (notify: Notify) => {
  provide(notifyKey, (notification: Notification) => {
    const { semantics = 'success', message = 'operation-successful', duration = 3000 } = notification

    return notify({
      semantics,
      message,
      duration
    })
  })
}

export const useNotify = (): I18nNotify => {
  const notify = inject(notifyKey)!
  return (notification: Notification) => {
    notify(notification)
  }
}
