<script setup lang="ts">
  interface Emits {
    (e: 'afterEnter'): void
    (e: 'afterLeave'): void
  }

  const emit = defineEmits<Emits>()

  let contentHeight = 0

  const onBeforeEnter = (el: HTMLElement) => {
    const position = el.style.position
    const opacity = el.style.opacity
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    contentHeight = el.clientHeight
    document.body.removeChild(el)
    el.style.position = position
    el.style.opacity = opacity
    el.style.height = '0'
  }

  const onEnter = (el: HTMLElement) => {
    requestAnimationFrame(() => {
      el.style.height = `${contentHeight}px`
    })
  }

  const onBeforeLeave = (el: HTMLElement) => {
    el.style.height = `${el.clientHeight}px`
  }

  const onLeave = (el: HTMLElement) => {
    el.style.height = '0'
  }

  const onAfterEnter = (el: HTMLElement) => {
    el.style.height = ''
    emit('afterEnter')
  }

  const onAfterLeave = (el: HTMLElement) => {
    el.style.height = ''
    emit('afterLeave')
  }
</script>

<template>
  <Transition
    enterActiveClass="transform transition-all origin-top"
    enterFromClass="scale-y-0"
    enterToClass="scale-y-100"
    leaveActiveClass="transform transition-all origin-top"
    leaveFromClass="scale-y-100"
    leaveToClass="scale-y-0 py-0"
    @beforeEnter="onBeforeEnter"
    @enter="onEnter"
    @afterEnter="onAfterEnter"
    @beforeLeave="onBeforeLeave"
    @leave="onLeave"
    @afterLeave="onAfterLeave"
  >
    <slot />
  </Transition>
</template>
