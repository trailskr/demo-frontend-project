<script setup lang="ts">
  import { MaybeElement } from '@vueuse/core'
  import { isArray, isFunction, isObject, isString } from '@/utils/typecheck'
  import { debounce, escapeRegExp, fullTextSearch, Group, groupBy } from '@/utils/utils'

  import { IconGetter, NatInputSelectExpose, SelectedIndices } from './inputSelect'

  // copied due to defineProps macro restrictions
  type ObjectOption = object
  type Option = number | string | ObjectOption
  type Options = Option[]
  type Key = string | number
  type ModelValueSingle = number | string | Option | null | undefined
  type ModelValueMultiple = string[] | number[] | Option[]
  type ModelValue = ModelValueSingle | ModelValueMultiple
  type TextGetter = (option: Option) => string
  type KeyGetter = (option: Option) => Key
  type ObjectTextGetter = (option: ObjectOption) => string
  type ObjectKeyGetter = (option: ObjectOption) => Key
  type OptionBooleanGetter = (option: Option) => boolean
  type ModelValueGetter = (option: ModelValueSingle) => ModelValueSingle

  interface FetchOptions {
    page: number
    limit: number
    offset: number
    query: string
  }

  type SelectFetch<T> = (options: FetchOptions) => Promise<T[]> | T[] | undefined

  interface Props {
    modelValue?: ModelValue
    options?: Options
    optionText?: string | ObjectTextGetter
    optionIcon?: IconGetter
    optionKey?: string | ObjectKeyGetter
    optionDisabled?: string | OptionBooleanGetter
    grouping?: boolean
    groupsHorisontal?: boolean
    optionGroupKey?: string | ObjectKeyGetter
    optionGroupText?: string | ObjectTextGetter
    showGroupText?: boolean
    allowClear?: boolean
    limit?: number
    placeholder?: string
    multiple?: boolean
    allowSelectGroups?: boolean
    maxItems?: number
    // tagging is only for text options and automatically adds multiple
    tagging?: boolean
    // autocomplete is only for text options
    autocomplete?: boolean
    keyAsModel?: boolean
    keyAsValueText?: boolean
    fetch?: SelectFetch<any>
    debounce?: number
    disabled?: boolean
    noManualInput?: boolean
    hideControls?: boolean
    dropdownOffset?: [x: number, y: number]
    dropdownWithOffset?: number
    dropdownCloseAfterSelect?: boolean
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right'
    referenceRef?: MaybeElement
  }

  const props = withDefaults(defineProps<Props>(), {
    options: () => [],
    optionText: 'name',
    optionKey: 'id',
    optionDisabled: 'disabled',
    limit: 25,
    multiple: false,
    maxItems: 3,
    allowClear: true,
    debounce: 300,
    textAlign: 'start',
    dropdownOffset: () => [0, 2]
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'reset'): void
    (e: 'loading', isLoading: boolean): void
    (e: 'select', option: any /* Option | Group<Option> */): void
    (e: 'enter', option: any /* Option | Group<Option> */): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  const root = ref<HTMLElement>()
  const computedReferenceRef = computed(() => props.referenceRef ?? root.value)

  const value = useVModel(props, 'modelValue', emit)

  const isMultipleValue = (v: ModelValue): v is ModelValueMultiple => isArray(v)

  const isMultiple = computed(() => props.tagging || props.multiple)

  const hasValue = computed(() => isMultiple.value ? (isMultipleValue(value.value) && value.value.length > 0) : value.value != null)

  const hiddenValues = computed(() => {
    if (!isMultiple.value || !isMultipleValue(value.value)) return []
    if (value.value.length <= props.maxItems) return []
    return value.value.slice(0, -props.maxItems + 1)
  })
  const visibleValues = computed(() => {
    if (!isMultiple.value || !isMultipleValue(value.value)) return []
    if (value.value.length <= props.maxItems) return value.value
    return value.value.slice(hiddenValues.value.length)
  })
  const removeHiddenValues = () => {
    if (!isMultiple.value || !isMultipleValue(value.value)) return
    value.value.splice(0, hiddenValues.value.length)
  }

  const fetchedTotal = ref<number>()
  const fetchedOptions = ref<Options>([])
  const activeOptions = computed<Options>(() => props.fetch ? fetchedOptions.value : props.options)

  const objectOptions = computed<boolean>(() => isObject(value.value) || isObject(activeOptions.value?.[0]))

  const objectTextGetter = computed<ObjectTextGetter>(() => {
    const optionText = props.optionText
    return isString(optionText)
      ? ((option: ObjectOption) => ((option as Record<string, any>)[optionText] ?? '').toString()) as ObjectTextGetter
      : optionText
  })

  const objectKeyGetter = computed<ObjectKeyGetter>(() => {
    const optionKey = props.optionKey
    return isString(optionKey)
      ? ((option: ObjectOption) => (option as Record<string, unknown>)[optionKey]) as ObjectKeyGetter
      : optionKey
  })

  const objectGroupTextGetter = computed<ObjectTextGetter | undefined>(() => {
    const optionGroupText = props.optionGroupText
    return isString(optionGroupText)
      ? ((option: ObjectOption) => (option as Record<string, unknown>)[optionGroupText]) as ObjectTextGetter
      : optionGroupText
  })

  const objectGroupKeyGetter = computed<ObjectKeyGetter | undefined>(() => {
    const optionGroupKey = props.optionGroupKey
    return isString(optionGroupKey)
      ? ((option: ObjectOption) => (option as Record<string, unknown>)[optionGroupKey]) as ObjectKeyGetter
      : optionGroupKey
  })

  const disabledObjectGetter = computed<OptionBooleanGetter>(() => {
    const optionDisabled = props.optionDisabled
    return isString(optionDisabled)
      ? ((option: ObjectOption) => (option as Record<string, unknown>)[optionDisabled]) as OptionBooleanGetter
      : optionDisabled
  })

  const stringTextGetter = computed<TextGetter | undefined>(() => {
    const optionText = props.optionText as TextGetter | undefined
    return isFunction(optionText) ? optionText : undefined
  })

  const stringKeyGetter = computed<KeyGetter | undefined>(() => {
    const optionKey = props.optionKey as KeyGetter | undefined
    return isFunction(optionKey) ? optionKey : undefined
  })

  const stringGroupTextGetter = computed<TextGetter | undefined>(() => {
    const optionGroupText = props.optionGroupText as TextGetter | undefined
    return isFunction(optionGroupText) ? optionGroupText : undefined
  })

  const stringGroupKeyGetter = computed<KeyGetter | undefined>(() => {
    const optionGroupKey = props.optionGroupKey as KeyGetter | undefined
    return isFunction(optionGroupKey) ? optionGroupKey : undefined
  })

  const disabledStringGetter = computed<OptionBooleanGetter | undefined>(() => {
    const optionDisabled = props.optionDisabled as OptionBooleanGetter | undefined
    return isFunction(optionDisabled) ? optionDisabled : undefined
  })

  const textGetter = computed((): TextGetter => {
    if (objectOptions.value) return objectTextGetter.value as TextGetter
    if (stringTextGetter.value) return stringTextGetter.value
    return ((data: Option) => data ? data.toString() : '') as TextGetter
  })

  const keyGetter = computed((): KeyGetter => {
    if (objectOptions.value) return objectKeyGetter.value as KeyGetter
    if (stringKeyGetter.value) return stringKeyGetter.value
    return ((data: ModelValueSingle) => data) as KeyGetter
  })

  const groupTextGetter = computed((): TextGetter | undefined => {
    if (objectOptions.value) return objectGroupTextGetter.value as TextGetter
    if (stringGroupTextGetter.value) return stringGroupTextGetter.value
    return undefined
  })

  const groupKeyGetter = computed((): KeyGetter | undefined => {
    if (objectOptions.value) return objectGroupKeyGetter.value as KeyGetter
    if (stringGroupKeyGetter.value) return stringGroupKeyGetter.value
    return undefined
  })

  const disabledGetter = computed((): OptionBooleanGetter => {
    if (objectOptions.value) return disabledObjectGetter.value
    if (disabledStringGetter.value) return disabledStringGetter.value
    return () => false
  })

  const modelValueGetter = computed<ModelValueGetter>(() => {
    return props.keyAsModel
      ? objectKeyGetter.value as ModelValueGetter
      : (data: ModelValueSingle) => data
  })

  const optionsMap = computed(() => {
    const map: Record<Key, Option> = {}
    const valueGet = keyGetter.value
    const options = activeOptions.value
    options.forEach((option) => {
      map[valueGet(option)] = option
    })
    return map
  })

  const getOptionByModelValue = (v: ModelValue): Option => {
    return objectOptions.value && props.keyAsModel
      ? optionsMap.value[v as Key]
      : v as ObjectOption
  }

  const getValueText = (val: ModelValue): string => {
    const option = getOptionByModelValue(val)
    return option != null && !props.keyAsValueText
      ? textGetter.value(option)
      : val?.toString() ?? ''
  }

  const input = ref('')

  watchEffect(() => {
    const val = value.value
    input.value = val == null
      ? ''
      : isArray(val)
        ? ''
        : getValueText(val)
  })

  const query = ref(input.value.toString())

  const showDropdown = ref(false)
  const cursorIndices = reactive<SelectedIndices>({})

  const setCursorIndex = ({ groupIndex, optionIndex }: SelectedIndices) => {
    cursorIndices.groupIndex = groupIndex
    cursorIndices.optionIndex = optionIndex
  }

  const isCursorOnIndex = ({ groupIndex, optionIndex }: SelectedIndices): boolean => {
    return cursorIndices.groupIndex === groupIndex &&
      cursorIndices.optionIndex === optionIndex
  }

  const page = ref(1)

  watch(page, () => {
    fetch()
  })

  const isLoading = ref(false)
  watch(isLoading, (v) => {
    emit('loading', v)
  })

  watch(value, (v) => {
    if (isMultiple.value) return
    input.value = v != null ? getValueText(v) : ''
    query.value = input.value
  })

  const debouncedSetQuery = computed(() => {
    const [set, clear] = debounce((v: string) => {
      query.value = v
    }, props.debounce)
    return { set, clear }
  })

  const openDropdown = () => {
    showDropdown.value = true
  }

  const closeDropdown = () => {
    showDropdown.value = false
    debouncedSetQuery.value.clear()
  }

  const filteredOptions = computed((): Options => {
    const queryTrimmed = query.value.trim()
    const textGet = textGetter.value
    const options = activeOptions.value
    const result = queryTrimmed
      ? options
        .map((option) => ({
          result: fullTextSearch(textGet(option), queryTrimmed, false),
          option
        }))
        .filter((item) => item.result)
        .sort((a, b) => a.result - b.result)
        .map((item) => item.option)
      : options

    return result.slice(0, activeLimit.value)
  })

  const filteredOptionsGrouped = computed(() => groupKeyGetter.value ? groupBy(filteredOptions.value, groupKeyGetter.value) : [])

  const activeTotal = computed(() => props.fetch ? fetchedTotal.value : filteredOptions.value.length)
  const activeLimit = computed(() => page.value * props.limit)

  const isFullyVisible = computed(() => {
    if (isLoading.value) return false
    return activeTotal.value == null || activeTotal.value < activeLimit.value
  })

  const highlightRe = computed(() => query.value ? new RegExp(escapeRegExp(query.value), 'i') : undefined)

  const inputRef = ref<HTMLInputElement>()

  let lastQuery: string | undefined
  let lastPage: number | undefined

  watch(() => props.fetch, () => {
    fetchedOptions.value = []
    fetchedTotal.value = undefined
    lastQuery = undefined
    lastPage = undefined
    page.value = 1
  })

  const fetch = () => {
    const fetchProp = props.fetch
    if (!fetchProp) return
    if (!showDropdown.value) return
    if (lastQuery === query.value && lastPage === page.value) return
    isLoading.value = true
    lastQuery = query.value
    lastPage = page.value
    Promise.resolve(fetchProp({
      page: page.value,
      limit: props.limit,
      offset: activeLimit.value - props.limit,
      query: query.value
    })).then((options) => {
      if (!options) return
      if (page.value === 1) {
        fetchedOptions.value = options
      } else {
        fetchedOptions.value = [...fetchedOptions.value, ...options]
      }
      fetchedTotal.value = fetchedOptions.value.length + (options.length < props.limit ? 0 : 1)
      // openDropdown()
    }).catch(() => {
      fetchedTotal.value = undefined
    }).finally(() => {
      isLoading.value = false
    })
  }

  let isFocused = false
  let focusTimeout: number | undefined

  const onFocus = () => {
    const inputEl = inputRef.value
    query.value = ''
    window.clearTimeout(focusTimeout)
    focusTimeout = window.setTimeout(() => {
      if (!isFocused && inputEl && !props.noManualInput) {
        inputEl.select()
        inputEl.setSelectionRange(0, inputEl.value.length)
      }
      fetch()
      isFocused = true
    }, 1)
    openDropdown()
  }

  const resetValue = () => {
    input.value = ''
    query.value = ''
    value.value = isMultiple.value ? [] : undefined
  }

  const reset = () => {
    cursorIndices.optionIndex = undefined
    cursorIndices.groupIndex = undefined
    closeDropdown()
    page.value = 1
    fetchedTotal.value = undefined
    resetValue()
    emit('reset')
  }

  const focus = () => {
    inputRef.value?.focus()
    onFocus()
  }

  const toExpose: NatInputSelectExpose = { reset, openDropdown, focus }
  defineExpose(toExpose)

  const dropdownContent = ref<HTMLElement>()
  const dropdownContentRef = (el: HTMLElement | undefined) => {
    dropdownContent.value = el
  }

  const onInput = (e: Event) => {
    const inputEl = e.target as HTMLInputElement
    input.value = inputEl.value
    debouncedSetQuery.value.set(input.value)
    if (props.fetch) {
      fetchedTotal.value = undefined
      if (dropdownContent.value) dropdownContent.value.scrollTop = 0
      watchOnce(query, fetch)
    }
    if (props.autocomplete && !isMultiple.value) {
      value.value = input.value
    }
    cursorIndices.optionIndex = undefined
    cursorIndices.groupIndex = undefined
    if (!input.value) {
      if (!isMultiple.value) reset()
    } else {
      page.value = 1
      openDropdown()
    }
  }

  const findItemInModel = (option: ModelValue) => {
    const valueArr = value.value as ModelValueMultiple
    const len = valueArr.length
    const v = keyGetter.value(option as ObjectOption)
    for (let index = 0; index < len; index++) {
      const found = valueArr[index]
      const item = modelValueGetter.value(found)
      if (keyGetter.value(item as ObjectOption) === v) return { index, found }
    }
    return {}
  }

  const onBlur = (e?: Event) => {
    isFocused = false
    if (e instanceof KeyboardEvent) {
      e.preventDefault()
      if (showDropdown.value) e.stopPropagation()
    }
    closeDropdown()
    if (!isMultiple.value) {
      input.value = value.value != null
        ? getValueText(value.value)
        : ''
      query.value = input.value
    } else if (props.tagging && input.value) {
      const newInput = (value.value as string[]).slice()
      newInput.push(input.value)
      value.value = newInput
      input.value = ''
      query.value = input.value
    } else {
      input.value = ''
      query.value = input.value
    }
  }

  const isSelected = (item: Option) => {
    if (!isMultiple.value) {
      const curValue = value.value as ModelValueSingle
      return curValue != null
        ? keyGetter.value(curValue) === keyGetter.value(item)
        : false
    } else {
      const curValue = value.value as ModelValueMultiple
      return curValue && curValue.length > 0
        ? findItemInModel(item).found != null
        : false
    }
  }

  const isSelectedGroup = (group: Group<Option>): boolean | undefined => {
    let selectedCount = 0
    group.items.forEach((option) => {
      if (isSelected(option)) selectedCount++
    })
    return selectedCount === 0
      ? false
      : selectedCount < group.items.length
        ? undefined
        : true
  }

  const isDisabledGroup = (group: Group<Option>) => {
    return group.items.every(disabledGetter.value)
  }

  /**
   * Value select handler, handle by enter and by mouse select, auto close options list
   */
  const select = (isEnterPressed = false) => {
    if (isEnterPressed && props.tagging && input.value) {
      return selectByEnter()
    }

    const group = getGroupToSelect()
    const option = getOptionToSelect(group)
    const hasOptions = option || typeof option === 'number'
    if (hasOptions) selectOption(option)
    if (!hasOptions && group) selectGroup(group)
    if (isEnterPressed && !hasOptions && !group) emit('enter', input.value)

    if (props.dropdownCloseAfterSelect || !isMultiple.value) {
      inputRef.value?.blur()
    }
  }

  const selectByEnter = () => {
    value.value = [...value.value as ModelValueMultiple, input.value] as ModelValueMultiple
    input.value = ''
    query.value = input.value
  }

  const getGroupToSelect = () => {
    return cursorIndices.groupIndex == null
      ? undefined
      : filteredOptionsGrouped.value[cursorIndices.groupIndex]
  }

  const getOptionToSelect = (group?: Group<Option, Key>) => {
    return cursorIndices.optionIndex == null
      ? undefined
      : group
        ? group.items[cursorIndices.optionIndex]
        : filteredOptions.value[cursorIndices.optionIndex]
  }

  const selectOption = (option: Option) => {
    if (disabledGetter.value(option)) return
    const selectedValue = modelValueGetter.value(option)

    if (!isMultiple.value) {
      value.value = selectedValue
      input.value = selectedValue
        ? getValueText(selectedValue)
        : ''
      query.value = input.value
    } else {
      const valueArr = value.value as ModelValueMultiple | undefined
      input.value = ''
      query.value = input.value
      if (!valueArr || !valueArr.length) {
        value.value = [selectedValue] as ModelValueMultiple
      } else {
        const result = findItemInModel(selectedValue)
        if (result.found) {
          valueArr.splice(result.index, 1)
        } else {
          value.value = [...valueArr, selectedValue] as ModelValueMultiple
        }
      }
    }

    emit('select', option)
  }

  const selectGroup = (group: Group<Option, Key>) => {
    // can't select groups when not multiple
    if (isMultiple.value) {
      const selectedValues = group.items
        .filter((o) => !disabledGetter.value(o))
        .map(modelValueGetter.value)
      const valueArr = value.value as ModelValueMultiple | undefined
      input.value = ''
      query.value = input.value

      if (!valueArr || !valueArr.length) {
        value.value = selectedValues as ModelValueMultiple
      } else {
        const indicesToRemove = new Set<number>()
        const valuesToAdd: ModelValueMultiple = []
        selectedValues.forEach((v) => {
          const result = findItemInModel(v)
          if (result.found) {
            indicesToRemove.add(result.index)
          } else {
            (valuesToAdd as Option[]).push(v as Option)
          }
        })
        if (valuesToAdd.length === 0) {
          // unselect all if nothing to add
          value.value = valueArr.filter((_, index) => !indicesToRemove.has(index))
        } else {
          value.value = valueArr.filter((_, index) => indicesToRemove.has(index))
          value.value = [...valueArr, ...valuesToAdd] as ModelValueMultiple
        }
      }
    }

    emit('select', group)
  }

  const up = () => {
    if (!showDropdown.value) {
      onFocus()
      return
    }
    if (props.grouping) {
      const groups = filteredOptionsGrouped.value
      if (cursorIndices.groupIndex == null) {
        // last item of last group
        cursorIndices.groupIndex = Math.max(0, groups.length - 1)
        const group = groups[cursorIndices.groupIndex]
        cursorIndices.optionIndex = group ? Math.max(0, group.items.length - 1) : undefined
        return
      }
      // selected group iteself
      if (cursorIndices.optionIndex == null) {
        if (cursorIndices.groupIndex === 0) return // group is first, nothing to select
        // selecting last item of previous group
        cursorIndices.groupIndex--
        const group = groups[cursorIndices.groupIndex]
        cursorIndices.optionIndex = Math.max(0, group.items.length - 1)
        return
      }
      const allowSelectGroups = isMultiple.value && props.allowSelectGroups
      if (cursorIndices.optionIndex === 0) {
        if (allowSelectGroups) {
          cursorIndices.optionIndex = undefined // selecting group itself
          return
        }
        if (cursorIndices.groupIndex === 0) return // group is first, nothing to select
        // selecting last item of previous group
        cursorIndices.groupIndex--
        const group = groups[cursorIndices.groupIndex]
        cursorIndices.optionIndex = Math.max(0, group.items.length - 1)
        return
      }
      cursorIndices.optionIndex-- // selecting previous item of the group
      return
    }
    cursorIndices.groupIndex = undefined
    cursorIndices.optionIndex = Math.max(0, cursorIndices.optionIndex == null
      ? activeOptions.value.length - 1 // last item
      : cursorIndices.optionIndex - 1) // prev item
  }

  const down = () => {
    if (!showDropdown.value) {
      onFocus()
      return
    }
    if (props.grouping) {
      const groups = filteredOptionsGrouped.value
      if (cursorIndices.groupIndex == null) {
        if (isMultiple.value && props.allowSelectGroups) {
          // selecting first group iteself
          cursorIndices.groupIndex = 0
          cursorIndices.optionIndex = undefined
          return
        }
        // first item of first group
        cursorIndices.groupIndex = 0
        const group = groups[cursorIndices.groupIndex]
        cursorIndices.optionIndex = group ? 0 : undefined
        return
      }
      // selected group iteself
      if (cursorIndices.optionIndex == null) {
        // selecting first items of the group
        cursorIndices.optionIndex = 0
        return
      }
      const group = groups[cursorIndices.groupIndex]
      if (cursorIndices.optionIndex === group.items.length - 1) {
        if (cursorIndices.groupIndex === groups.length - 1) return // last item of last group - nothing to select
        cursorIndices.groupIndex = Math.max(groups.length - 1, cursorIndices.groupIndex + 1)
        cursorIndices.optionIndex = isMultiple.value && props.allowSelectGroups
          ? undefined // selecting next group itself
          : 0 // selecting first items of next group
        return
      }
      cursorIndices.optionIndex++ // selecting next item of the group
      return
    }
    cursorIndices.groupIndex = undefined
    cursorIndices.optionIndex = cursorIndices.optionIndex == null
      ? 0 // first item
      : Math.min(activeOptions.value.length - 1, cursorIndices.optionIndex + 1) // next item
  }

  const removeItem = (index: number) => {
    const valueArr = value.value as unknown[]
    valueArr.splice(index, 1)
  }

  const removeLast = (e: Event) => {
    const valueArr = value.value as ModelValueMultiple
    if (valueArr && valueArr.length > 0 && input.value.length === 0) {
      const last = valueArr.pop()
      if (props.tagging) {
        input.value = last ? textGetter.value(last as ObjectOption) : ''
        query.value = input.value
        e.preventDefault()
      }
    }
  }

  const highlight = (data?: string | number): string[] => {
    if (data == null) return ['']
    const str = data.toString()
    if (!highlightRe.value) return [str]
    return str
      ? str.replace(highlightRe.value, '<*!*>$&<*!*>').split('<*!*>')
      : ['']
  }
</script>

<template>
  <label
    ref="root"
    class="flex items-stretch flex-auto relative space-x-1"
  >
    <div
      v-if="isMultiple && isMultipleValue(value) && value.length > 0"
      class="flex space-x-1"
    >
      <NatChip
        v-if="hiddenValues.length > 0"
        semantics="accent"
        :label="t('select.number-more', { number: hiddenValues.length })"
        :closable="!disabled"
        @close="removeHiddenValues()"
      />
      <NatChip
        v-for="(item, index) in visibleValues"
        :key="index"
        semantics="accent"
        :label="textGetter(item)"
        :closable="!disabled"
        @close="removeItem(hiddenValues.length + index)"
      />
    </div>
    <input
      ref="inputRef"
      class="w-full flex-auto"
      type="text"
      :placeholder="hasValue ? '' : placeholder"
      :value="input"
      :disabled="disabled"
      :readonly="noManualInput"
      :style="{ textAlign: textAlign }"
      @input="onInput"
      @click="onFocus()"
      @keydown.up.stop.prevent="up"
      @keydown.down.stop.prevent="down"
      @keydown.enter.stop.prevent="select(true)"
      @keydown.esc="onBlur"
      @keydown.delete.stop="removeLast"
      @blur="onBlur"
      :autocomplete="autocomplete ? 'chrome-off' : ''"
    >
    <SelectControls
      v-if="!hideControls"
      :hasValue="hasValue"
      :multiple="isMultiple"
      :disabled="disabled"
      :allowClear="allowClear"
      @reset="reset"
      @angle="onFocus()"
    />
    <NatDropdown
      v-model="showDropdown"
      :offset="dropdownOffset"
      :withOffset="dropdownWithOffset"
      :referenceRef="computedReferenceRef"
      :contentRef="dropdownContentRef"
      contentClass="bg-white"
      applyMaxSize
      applySameWidth
      @pointerdown.stop.prevent="() => {}"
    >
      <NatInputSelectMenu
        :query="query"
        :isLoading="isLoading"
        :isFullyVisible="isFullyVisible"
        :multiple="isMultiple"
        :allowSelectGroups="allowSelectGroups"
        :activeTotal="activeTotal"
        :filteredOptions="filteredOptions"
        :filteredOptionsGrouped="filteredOptionsGrouped"
        :keyGetter="keyGetter"
        :textGetter="textGetter"
        :iconGetter="optionIcon"
        :grouping="grouping"
        :groupsHorisontal="groupsHorisontal"
        :groupKeyGetter="groupKeyGetter"
        :groupTextGetter="groupTextGetter"
        :showGroupText="showGroupText"
        :isSelectedGetter="isSelected"
        :isSelectedGroupGetter="isSelectedGroup"
        :isDisabledGroupGetter="isDisabledGroup"
        :isDisabledGetter="disabledGetter"
        :setCursorIndex="setCursorIndex"
        :isCursorOnIndexGetter="isCursorOnIndex"
        :highlight="highlight"
        :select="select"
        :nextPage="() => page++"
      />
    </NatDropdown>
  </label>
</template>
