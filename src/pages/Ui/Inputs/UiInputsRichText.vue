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
      label="RichText"
      :modelValue="text1"
    >
      <NatAsyncRichText
        v-model="text1"
        required
        :disabled="disabled"
        label="Text field"
        placeholder="placeholder"
      />
    </UiInputField>
    <UiInputField
      label="RichTextOutput"
      :showValue="false"
    >
      <NatAsyncRichTextOutput
        :modelValue="text1"
      />
    </UiInputField>
  </NatForm>
</template>
