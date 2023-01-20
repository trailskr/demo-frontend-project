<script setup lang="ts">
  import { ComponentPublicInstance } from 'vue'

  const scrollbars = ref<ComponentPublicInstance>()

  const left = ref(0)
  const top = ref(0)

  watchEffect(() => {
    const el = unrefElement(scrollbars)
    if (!el) return
    el.scrollLeft = left.value
    el.scrollTop = top.value
  })
</script>

<template>
  <NatScrollbars
    ref="scrollbars"
    v-model:left="left"
    v-model:top="top"
    :leftShift="left"
    :topShift="top"
    class="overflow-hidden"
  >
    <slot />
  </NatScrollbars>
</template>
