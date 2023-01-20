<script setup lang="ts">
  const disabled = ref(false)

  const number1 = ref<number>()
  const number2 = ref<number>()
</script>

<template>
  <NatForm class="space-y-2">
    <NatCheckbox
      v-model="disabled"
      label="disabled"
    />
    <UiInputField
      label="Range"
      :modelValue="number1"
    >
      <NatRange
        v-model="number1"
        :disabled="disabled"
        label="Range field"
      />
    </UiInputField>
    <UiInputField
      label="Range"
      :modelValue="number2"
    >
      <NatRange
        v-model="number2"
        :disabled="disabled"
        label="Range field"
        :min="-1"
        :max="1"
        :step="0.1"
      />
    </UiInputField>
  </NatForm>
</template>
