<script setup lang="ts">
  interface Props {
    label: string
    modelValue?: any
    showValue?: boolean
  }

  withDefaults(defineProps<Props>(), {
    showValue: true
  })
</script>

<template>
  <section>
    <h2 class="text-5 font-semibold my-2">
      {{ label }}
    </h2>
    <div class="grid grid-cols-[1fr_2fr_1fr] gap-2 items-end">
      <slot />
      <NatField
        v-if="showValue"
        label="Value"
      >
        <ViewValue :modelValue="modelValue" />
      </NatField>
      <slot name="controls" />
    </div>
  </section>
</template>
