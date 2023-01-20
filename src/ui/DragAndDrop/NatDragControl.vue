<script setup lang="ts">
  import { inject, onMounted, onUnmounted, getCurrentInstance } from 'vue'

  import { useForwardTemplateRef } from '@/use/useForwardTemplateRef'

  import { dragControlPropertyName, dragAndDropKey, CmvDragControl, VueComponent, DragElement } from './dragAndDropManager'

  const draggable = inject(dragAndDropKey)!.exposed

  defineExpose({ draggable })

  onMounted(() => {
    if (draggable) draggable.numDragControls++
  })

  onUnmounted(() => {
    if (draggable) draggable.numDragControls--
  })

  const selfInstance = getCurrentInstance()

  const { refFn: refControlHandler } = useForwardTemplateRef((element) => {
    if (element) {
      (element as DragElement)[dragControlPropertyName] = selfInstance as unknown as VueComponent<CmvDragControl>
    }
  })

  const refControl = refControlHandler as (el: any) => void
</script>

<template>
  <slot :refControlHandler="refControl" />
</template>
