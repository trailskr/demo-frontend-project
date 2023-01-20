<script setup lang="ts">
  import { Semantics, Variant } from './button'

  interface Props {
    semantics?: Semantics
    variant?: Variant
    groupClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    semantics: 'accent',
    variant: 'solid'
  })

  const semanticClasses: Record<Variant, Record<Semantics, string>> = {
    solid: {
      accent: '',
      primary: '',
      secondary: '',
      emphasis: '',
      substrate: 'border-primary border-1',
      link: 'border-substrate border-1',
      danger: ''
    },
    outline: {
      accent: 'border-accent border-1',
      primary: 'border-primary border-1',
      secondary: 'border-secondary border-1',
      emphasis: 'border-emphasis border-1',
      substrate: 'border-emphasis border-1',
      link: 'border-secondary border-1',
      danger: 'border-danger border-1'
    }
  }

  const semanticsClass = computed(() => props.groupClass ?? semanticClasses[props.variant][props.semantics])
</script>
<template>
  <div class="inline-block rounded-5px relative">
    <div
      class="absolute inset-0 rounded-5px pointer-events-none"
      :class="semanticsClass"
    />
    <div class="group_buttonGroup flex items-center">
      <slot />
    </div>
  </div>
</template>
