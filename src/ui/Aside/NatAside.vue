<script setup lang="ts">
  interface Props {
    modelValue?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {})

  let isOpen = false // open state
  const isAnimationInProgress = ref(false) // should turned on - first, off - last
  const animationTrigger = ref(false) // should turned on - last, off - first

  const close = () => {
    if (!isOpen) return
    isOpen = false
    animationTrigger.value = false
  }

  const open = () => {
    if (isOpen) return
    isOpen = true
    isAnimationInProgress.value = true
    setTimeout(() => {
      animationTrigger.value = true
    })
  }

  const onAnimationFinish = () => {
    if (!isAnimationInProgress.value) return
    isAnimationInProgress.value = false
  }

  watch(() => props.modelValue, (value) => {
    if (value) open()
    else close()
  }, { immediate: true })
</script>

<script lang="ts">
  export default defineComponent({
    name: 'NatAside',
    inheritAttrs: false
  })
</script>

<template>
  <Teleport
    v-if="isAnimationInProgress"
    to="body"
  >
    <Transition
      enterActiveClass="transition-transform"
      enterFromClass="-translate-x-100%"
      enterToClass="translate-x-0"
      leaveActiveClass="transition-transform"
      leaveFromClass="translate-x-0"
      leaveToClass="-translate-x-100%"
      @afterLeave="onAnimationFinish"
    >
      <aside
        v-show="animationTrigger"
        v-bind="$attrs"
        class="fixed inset-0 bg-background z-1"
      >
        <slot />
      </aside>
    </Transition>
  </Teleport>
</template>
