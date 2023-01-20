<script setup lang="ts">
  import { AlertSemantics } from '@/ui/Alert/alert'
  import { useLocalVModel } from '@/use/useLocalVModel'

  interface Props {
    semantics?: AlertSemantics
    modelValue?: boolean
    message?: string
    duration?: number
    dismissable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: true,
    semantics: 'info'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'show'): void
    (e: 'hide'): void
    (e: 'afterEnter'): void
    (e: 'afterLeave'): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  const isVisible = useLocalVModel(props, 'modelValue', emit, { defaultValue: false })

  watch(isVisible, (v) => {
    if (v) {
      emit('show')
      if (props.duration == null || props.duration === 0) return
      setTimeout(() => {
        isVisible.value = false
      }, props.duration)
    } else {
      emit('hide')
    }
  }, { immediate: true })

  const semanticsClass = computed(() => ({
    info: 'bg-info text-primary',
    error: 'bg-danger text-white',
    success: 'bg-positive text-white',
    warning: 'bg-warning text-primary'
  }[props.semantics]))
</script>

<template>
  <NatExpandBottomTransition
    @afterEnter="emit('afterEnter')"
    @afterLeave="emit('afterLeave')"
  >
    <div
      v-if="isVisible"
      class="flex items-center justify-between font-medium relative rounded-lg px-3 py-2 space-x-2"
      :class="semanticsClass"
      role="alert"
    >
      <div><slot>{{ message }}</slot></div>
      <NatButton
        v-if="dismissable"
        semantics="link"
        class="text-white p-0.75"
        rounded
        :padding="false"
        :title="t('to-close')"
        @click="isVisible = false"
      >
        <IconEvaCloseFill
          width="1.5rem"
          height="1.5rem"
        />
      </NatButton>
    </div>
  </NatExpandBottomTransition>
</template>
