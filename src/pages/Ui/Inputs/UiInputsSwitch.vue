<script setup lang="ts">
  const disabled = ref(false)
  const labelLeft = ref(false)

  const boolean1 = ref<boolean>()
</script>

<template>
  <NatForm class="space-y-2">
    <NatCheckbox
      v-model="disabled"
      label="disabled"
    />
    <NatCheckbox
      v-model="labelLeft"
      label="label left"
    />
    <UiInputField
      label="Switch"
      :modelValue="boolean1"
    >
      <NatSwitch
        v-model="boolean1"
        :disabled="disabled"
        :labelLeft="labelLeft"
        label="Switch field"
      />
    </UiInputField>
  </NatForm>
</template>
