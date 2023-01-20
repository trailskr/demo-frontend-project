<script setup lang="ts">
  import { Placement } from '@popperjs/core'

  type Props = {
    placement?: Placement
  }

  withDefaults(defineProps<Props>(), {
    placement: 'bottom-start'
  })
</script>

<template>
  <NatPopover :placement="placement">
    <template #reference="binding">
      <slot
        name="reference"
        v-bind="binding"
      />
    </template>
    <template #default="binding">
      <slot v-bind="binding" />
    </template>
  </NatPopover>
</template>
