<script setup lang="ts">
  import { Validation } from '@/utils/Validation'
  import { isArray } from '@/utils/typecheck'

  import { IconGetter, NatInputSelectExpose } from '../Inputs/Select/inputSelect'

  // copied due to defineProps macro restrictions
  type ObjectOption = object
  type Option = number | string | ObjectOption
  type Options = Option[]
  type Key = string | number
  type ModelValueSingle = number | string | Option | null | undefined
  type ModelValueMultiple = string[] | number[] | Option[]
  type ModelValue = ModelValueSingle | ModelValueMultiple
  type ObjectTextGetter = (option: ObjectOption) => string
  type ObjectKeyGetter = (option: ObjectOption) => Key
  type OptionBooleanGetter = (option: Option) => boolean

  interface FetchOptions {
    page: number
    limit: number
    offset: number
    query: string
  }

  type SelectFetch<T> = (options: FetchOptions) => Promise<T[]> | T[] | undefined

  interface Props {
    // Field
    name?: string
    validation?: Validation
    label?: string
    disabled?: boolean
    noManualInput?: boolean
    required?: boolean
    placeholder?: string
    contentClass?: string

    // InputSelect
    modelValue?: ModelValue
    options?: Options
    optionText?: string | ObjectTextGetter
    optionKey?: string | ObjectKeyGetter
    optionIcon?: IconGetter
    optionDisabled?: string | OptionBooleanGetter
    grouping?: boolean
    groupsHorisontal?: boolean
    optionGroupKey?: string | ObjectKeyGetter
    optionGroupText?: string | ObjectTextGetter
    showGroupText?: boolean
    allowClear?: boolean
    limit?: number
    multiple?: boolean
    allowSelectGroups?: boolean
    // tagging is only for text options
    tagging?: boolean
    // autocomplete is only for text options
    autocomplete?: boolean
    keyAsModel?: boolean
    keyAsValueText?: boolean
    fetch?: SelectFetch<any>
    debounce?: number
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right'
    dropdownOffset?: [x: number, y: number]
    dropdownCloseAfterSelect?: boolean
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    options: () => [],
    optionText: 'name',
    optionKey: 'id',
    limit: 25,
    allowClear: true,
    debounce: 300
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'reset'): void
    (e: 'loading', isLoading: boolean): void
    (e: 'select', option: any /* Option | Group<Option> */): void
    (e: 'enter', option: any /* Option | Group<Option> */): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)

  const isMultipleValue = (v: ModelValue): v is ModelValueMultiple => isArray(v)

  const isLoading = ref(false)

  const selectInput = ref<NatInputSelectExpose>()

  const reset = () => {
    selectInput.value?.reset()
    emit('reset')
  }

  const focus = () => {
    selectInput.value?.focus()
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
    :compact="compact"
  >
    <template #default="{ field, contentRef }">
      <NatInputSelect
        ref="selectInput"
        class="w-full"
        v-bind="field"
        :options="options"
        :optionText="optionText"
        :optionIcon="optionIcon"
        :optionKey="optionKey"
        :optionDisabled="optionDisabled"
        :grouping="grouping"
        :groupsHorisontal="groupsHorisontal"
        :optionGroupKey="optionGroupKey"
        :optionGroupText="optionGroupText"
        :showGroupText="showGroupText"
        :allowClear="allowClear"
        :limit="limit"
        :multiple="multiple"
        :allowSelectGroups="allowSelectGroups"
        :tagging="tagging"
        :autocomplete="autocomplete"
        :keyAsModel="keyAsModel"
        :keyAsValueText="keyAsValueText"
        :fetch="fetch"
        :debounce="debounce"
        :dropdownOffset="dropdownOffset"
        :dropdownCloseAfterSelect="dropdownCloseAfterSelect"
        :referenceRef="contentRef"
        :textAlign="textAlign"
        :noManualInput="noManualInput"
        hideControls
        @loading="isLoading = $event; emit('loading', $event)"
        @select="emit('select', $event)"
        @enter="emit('enter', $event)"
        @reset="emit('reset')"
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
      <SelectControls
        ref="selectControls"
        :hasValue="multiple ? isMultipleValue(modelValue) && modelValue.length > 0 : !!modelValue"
        :multiple="multiple"
        :disabled="disabled"
        :allowClear="allowClear"
        :isLoading="isLoading"
        @reset="reset"
        @angle="focus"
      />
    </template>
  </NatField>
</template>
