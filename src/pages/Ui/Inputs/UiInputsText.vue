<script setup lang="ts">
  import { v } from '@/utils/Validation'

  const disabled = ref(false)

  const text1 = ref<string>()

  const validation = reactive(v().addChildren({
    text1: v().string().required().msg('value is required')
  }))
</script>

<template>
  <NatForm class="space-y-2">
    Form is invalid: {{ validation.isInvalid }}
    <NatCheckbox
      v-model="disabled"
      label="disabled"
    />
    <UiInputField
      label="TextInput"
      :modelValue="text1"
    >
      <NatInputText
        v-model="text1"
        required
        :disabled="disabled"
        label="Text field"
        placeholder="placeholder"
      />
    </UiInputField>
    <UiInputField
      label="Text"
      :modelValue="text1"
    >
      <NatText
        v-model="text1"
        required
        :validation="validation.children.text1"
        :disabled="disabled"
        label="Text field"
        placeholder="placeholder"
      />
    </UiInputField>
    <UiInputField
      label="Text [multiline]"
      :modelValue="text1"
    >
      <NatText
        v-model="text1"
        required
        multiline
        :minHeightInRows="2"
        :maxHeightInRows="5"
        :validation="validation.children.text1"
        :disabled="disabled"
        label="Text field"
        placeholder="placeholder"
      />
    </UiInputField>
  </NatForm>
</template>
