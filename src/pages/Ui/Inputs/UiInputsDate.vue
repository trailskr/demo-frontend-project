<script setup lang="ts">
  import { v } from '@/utils/Validation'

  const disabled = ref(false)

  const dateTime = ref<string>('2022-08-09T19:12:16Z')
  const date = ref<string>('2022-08-09')
  const time = ref<string>('19:11')

  const validation = reactive(v())
</script>

<template>
  <div>
    Form is invalid: {{ validation.isInvalid }}
    <legend class="grid grid-cols-[2fr_2fr] gap-2">
      <div class="flex items-center space-x-2">
        <NatCheckbox
          v-model="disabled"
          label="disabled"
        />
      </div>
    </legend>
    <UiInputField
      label="InputDateTime"
      :modelValue="dateTime"
    >
      <NatInputDateTime
        v-model="dateTime"
        :disabled="disabled"
        date
        time
      />
    </UiInputField>
    <UiInputField
      label="DateTime"
      :modelValue="dateTime"
    >
      <NatDateTime
        v-model="dateTime"
        :disabled="disabled"
        date
        time
      />
    </UiInputField>
    <UiInputField
      label="Date"
      :modelValue="date"
    >
      <NatDateTime
        v-model="date"
        :disabled="disabled"
        date
      />
    </UiInputField>
    <UiInputField
      label="Time"
      :modelValue="time"
    >
      <NatDateTime
        v-model="time"
        :disabled="disabled"
        time
      />
    </UiInputField>
  </div>
</template>
