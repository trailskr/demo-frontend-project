<script setup lang="ts">
  import { Validation } from '@/utils/Validation'

  import { NatInputDateTimeExpose } from '../Inputs/DateTime/dateTime'

  interface Props {
    // Field
    name?: string
    validation?: Validation
    label?: string
    disabled?: boolean
    required?: boolean
    placeholder?: string
    contentClass?: string

    // InputDateTime
    modelValue?: string | null
    time?: boolean
    date?: boolean
    hideControls?: boolean
    noPastSelect?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)

  const dateInput = ref<NatInputDateTimeExpose>()

  const toggleDropdown = () => {
    dateInput.value?.toggleDropdown()
  }
</script>

<template>
  <NatField
    v-model="value"
    class="relative"
    :name="name"
    :validation="validation"
    :label="label"
    :disabled="disabled"
    :required="required"
    :placeholder="placeholder"
    :contentClass="contentClass"
  >
    <template #default="{ field, contentRef }">
      <NatInputDateTime
        ref="dateInput"
        class="w-full"
        v-bind="field"
        :referenceRef="contentRef"
        :time="time"
        :date="date"
        :noPastSelect="noPastSelect"
        hideControls
      />
    </template>
    <template
      v-if="$slots.left"
      #left
    >
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
      <DateTimeControls
        ref="selectControls"
        :disabled="disabled"
        :date="date"
        @click="toggleDropdown"
      />
    </template>
  </NatField>
</template>
