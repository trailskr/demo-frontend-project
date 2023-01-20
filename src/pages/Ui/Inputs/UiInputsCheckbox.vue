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
      label="Checkbox"
      :modelValue="boolean1"
    >
      <NatCheckbox
        v-model="boolean1"
        :disabled="disabled"
        :labelLeft="labelLeft"
        label="Checkbox field"
      />
    </UiInputField>
    <UiInputField
      label="Checkbox [indeterminate]"
      :modelValue="boolean1"
    >
      <NatCheckbox
        v-model="boolean1"
        indeterminate
        :disabled="disabled"
        :labelLeft="labelLeft"
        label="Checkbox field"
      />
    </UiInputField>
  </NatForm>
</template>
