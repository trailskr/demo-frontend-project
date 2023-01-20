<script setup lang="ts">
  import { removeElementFromArray } from '@/utils/utils'

  import { Notification } from './notification'
  import { useProvideNotify } from './notify'

  interface InnerNotification extends Notification {
    isVisible: boolean
  }

  const bottomNotifications = ref<InnerNotification[]>([])

  const notify = (notification: Notification): void => {
    const innerNotification = reactive({
      isVisible: true,
      ...notification
    })

    bottomNotifications.value.push(innerNotification)

    const duration = notification.duration || 3000
    setTimeout(() => {
      innerNotification.isVisible = false
    }, duration)
  }

  const remove = (notification: Notification) => {
    removeElementFromArray(bottomNotifications.value, notification)
  }

  useProvideNotify(notify)
</script>

<template>
  <slot />
  <ClientOnly>
    <Teleport to="body">
      <div class="fixed bottom-0 left-0 right-0 z-1 flex flex-col items-center justify-center mb-2 space-y-2">
        <NatAlert
          v-for="(notification, index) in bottomNotifications"
          :key="index"
          v-model="notification.isVisible"
          appear
          :semantics="notification.semantics"
          :message="notification.message"
          @afterLeave="remove(notification)"
        />
      </div>
    </Teleport>
  </ClientOnly>
</template>
