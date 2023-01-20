<script setup lang="ts">
  import { v } from '@/utils/Validation'

  const disabled = ref(false)

  const number1 = ref<number>()

  const validation = reactive(v().addChildren({
    number1: v().number().min(5).msg('value should be greater or equal to 5')
  }))
</script>

<template>
  <NatForm
    class="space-y-2"
  >
    Form is invalid: {{ validation.isInvalid }}
    <NatCheckbox
      v-model="disabled"
      label="disabled"
    />
    <UiInputField
      label="NumberInput [max=10]"
      :modelValue="number1"
    >
      <NatInputNumber
        v-model="number1"
        required
        :max="10"
        :disabled="disabled"
        label="Number field"
        placeholder="placeholder"
      />
    </UiInputField>
    <UiInputField
      label="Number [max=10]"
      :modelValue="number1"
    >
      <NatNumber
        v-model="number1"
        required
        :validation="validation.children.number1"
        :disabled="disabled"
        :max="10"
        label="Number field"
        placeholder="placeholder"
      />
    </UiInputField>
  </NatForm>
</template>
