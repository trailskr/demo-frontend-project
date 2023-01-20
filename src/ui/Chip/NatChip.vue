<script setup lang="ts">
  type Semantics = 'primary' | 'accent' | 'danger'

  interface Props {
    semantics?: Semantics
    label?: string
    disabled?: boolean
    closable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    semantics: 'accent'
  })

  const { t } = useI18n()

  const semanticsClasses: Record<Semantics, string> = {
    accent: 'bg-accent text-white',
    primary: 'bg-primary text-white',
    danger: 'bg-danger text-white'
  }

  const semanticsClass = computed(() => semanticsClasses[props.semantics])

  interface Emits {
    (e: 'close'): void
  }

  const emit = defineEmits<Emits>()
</script>

<template>
  <div
    class="inline-flex items-center rounded-5px pl-2 space-x-1 whitespace-nowrap"
    :class="[semanticsClass, {
      'pr-2': !closable
    }]"
  >
    <span><slot>{{ label }}</slot></span>
    <IconEvaCloseFill
      v-if="closable"
      width="24px"
      height="24px"
      class="rounded-5px cursor-pointer hover:bg-primary hover:bg-opacity-10"
      role="button"
      :title="t('to-close')"
      @click="emit('close')"
    />
  </div>
</template>
