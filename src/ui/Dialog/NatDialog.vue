<script setup lang="ts">
  import { useFocusTrap, UseFocusTrapReturn } from '@vueuse/integrations/useFocusTrap'

  import { onClickOutsideFixed } from '@/use/onClickOutsideFixed'

  import { addPopoverChildElement } from '../use/usePopovers'

  interface Props {
    modelValue?: boolean
    focusTrap?: boolean
    contentRef?: (el: HTMLElement | undefined) => void
    contentClass?: string | (string | Record<string, boolean>)[]
    closeByClickOutside?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    focusTrap: true,
    closeByClickOutside: true
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const content = ref<HTMLElement>()
  watch(content, (el) => {
    if (props.contentRef) props.contentRef(el)
  })

  const isShown = ref(false)
  const isVisible = ref(false)

  const body = document.body

  const trap = computed((): Partial<UseFocusTrapReturn> => props.focusTrap
    ? useFocusTrap(content, {
      allowOutsideClick: (e: MouseEvent | TouchEvent) => {
        const path = e.composedPath()
        return children.value.some(({ value }) => {
          return value ? path.includes(value) : false
        })
      }
    })
    : {})

  const close = (shouldEmit = true) => {
    if (!isShown.value || !isVisible.value) return
    trap.value.deactivate?.()
    if (shouldEmit) emit('update:modelValue', false)
    isVisible.value = false
    body.classList.remove('overflow-hidden')
    body.style.marginRight = ''
  }

  const onFinish = () => {
    if (!isShown.value) return
    isShown.value = false
  }

  const open = (shouldEmit = true) => {
    if (isShown.value) return
    if (shouldEmit) emit('update:modelValue', true)
    isShown.value = true
    isVisible.value = true
    nextTick(trap.value.activate)
    const scrollbarWidth = window.innerWidth - body.offsetWidth
    if (scrollbarWidth > 0) body.style.marginRight = `${scrollbarWidth}px`
    body.classList.add('overflow-hidden')
  }

  watch(() => props.modelValue, (value) => {
    if (value) open(false)
    else close(false)
  }, { immediate: true })

  const toggle = () => {
    if (isShown.value) close()
    else open()
  }

  const root = ref<HTMLElement>()
  const children = addPopoverChildElement(root)
  onClickOutsideFixed(content, (e) => { if (props.closeByClickOutside) close() }, { ignore: children })

  onBeforeUnmount(close)
</script>

<script lang="ts">
  export default defineComponent({
    inheritAttrs: false
  })
</script>

<template>
  <Teleport
    v-if="isShown"
    to="body"
  >
    <Transition
      enterActiveClass="transition-opacity"
      enterFromClass="opacity-0"
      enterToClass="opacity-100"
      leaveActiveClass="transition-opacity"
      leaveFromClass="opacity-100"
      leaveToClass="opacity-0"
      @afterLeave="onFinish"
    >
      <div
        v-show="isVisible"
        v-bind="$attrs"
        ref="root"
        class="bg-primary dark:bg-white bg-opacity-40 fixed inset-0 flex items-center justify-center transition z-1"
      >
        <div
          ref="content"
          :class="contentClass"
        >
          <slot
            :open="open"
            :close="close"
            :toggle="toggle"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
