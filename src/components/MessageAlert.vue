<script setup lang="ts">
  import NatAlert from '@/ui/Alert/NatAlert.vue'
  import { AlertSemantics } from '@/ui/Alert/alert'

  interface Props {
    modelValue?: string
    semantics?: AlertSemantics
    duration?: number
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const msg = useVModel(props, 'modelValue', emit)

  const isVisible = computed<boolean>({
    get: () => !!msg.value,
    set: (v: boolean) => { if (!v) msg.value = undefined }
  })

  const message = computed<string | undefined>(() => msg.value ?? undefined)
</script>

<template>
  <NatAlert
    v-model="isVisible"
    :semantics="semantics"
    :message="message"
    :duration="duration"
    dismissable
  />
</template>
