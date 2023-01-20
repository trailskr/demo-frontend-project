<script setup lang="ts">
  import { Validation } from '@/utils/Validation'

  export interface Props {
    // Field
    name?: string
    validation?: Validation
    label?: string
    disabled?: boolean
    required?: boolean
    placeholder?: string

    // VueTelInput
    modelValue?: string | null
    allCountries?: string[]
    autoFormat?: boolean
    customValidate?: boolean | RegExp
    defaultCountry?: string | number
    autoDefaultCountry?: boolean
    dropdownOptions?: object
    ignoredCountries?: string[]
    inputOptions?: object
    invalidMsg?: string
    mode?: string
    onlyCountries?: string[]
    preferredCountries?: string[]
    validCharactersOnly?: boolean
    styleClasses?: string | string[] | object
    dropdownOffset?: [x: number, y: number]
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'international',
    autoFormat: true,
    autoDefaultCountry: false,
    defaultCountry: 'us',
    validCharactersOnly: true,
    preferredCountries: () => ['us'],
    dropdownOptions: () => ({
      showDialCodeInSelection: true,
      showDialCodeInList: true,
      showFlags: true,
      tabindex: 0
    }),
    inputOptions: () => ({
      showDialCode: false
    })
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <NatField
    v-model="value"
    :name="name"
    :validation="validation"
    :label="label"
    :disabled="disabled"
    :required="required"
    :placeholder="placeholder"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template #default="{ field, contentRef }">
      <VueTelInput
        class="w-full"
        v-bind="field"
        :allCountries="allCountries"
        :autoFormat="autoFormat"
        :customValidate="customValidate"
        :defaultCountry="defaultCountry"
        :autoDefaultCountry="autoDefaultCountry"
        :dropdownOptions="dropdownOptions"
        :ignoredCountries="ignoredCountries"
        :inputOptions="inputOptions"
        :invalidMsg="invalidMsg"
        :mode="mode"
        :onlyCountries="onlyCountries"
        :preferredCountries="preferredCountries"
        :validCharactersOnly="validCharactersOnly"
        :styleClasses="styleClasses"
        :referenceRef="contentRef"
        :dropdownOffset="dropdownOffset"
      />
    </template>
  </NatField>
</template>
