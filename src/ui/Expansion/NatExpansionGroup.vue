<script setup lang="ts">
  import { Expansion, useExpansionGroup } from './expansion'

  interface Props {
    oneAtTime?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    oneAtTime: false
  })

  const expansions = useExpansionGroup({
    onOpen: (expansion: Expansion) => {
      if (!props.oneAtTime) return
      expansions.value.forEach((exp) => {
        if (exp.id !== expansion.id) exp.close()
      })
    }
  })
</script>

<template>
  <slot />
</template>
