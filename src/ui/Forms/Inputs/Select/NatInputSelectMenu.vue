<script setup lang="ts">
  import {
    Options,
    Option,
    KeyGetter,
    TextGetter,
    SelectedIndices, IconGetter
  } from '@/ui/Forms/Inputs/Select/inputSelect'
  import { Group } from '@/utils/utils'

  interface Props {
    query: string
    isLoading: boolean
    isFullyVisible: boolean
    multiple: boolean
    allowSelectGroups?: boolean
    activeTotal?: number
    filteredOptions: Options
    filteredOptionsGrouped: Group<Option>[]
    keyGetter: KeyGetter
    textGetter: TextGetter
    iconGetter?: IconGetter
    grouping?: boolean
    groupsHorisontal?: boolean
    groupTextGetter?: TextGetter
    showGroupText?: boolean
    isSelectedGetter: (option: Option) => boolean
    isDisabledGetter: (option: Option) => boolean
    isSelectedGroupGetter: (option: Group<Option>) => boolean | undefined
    isDisabledGroupGetter: (option: Group<Option>) => boolean
    setCursorIndex: (optionIndex: SelectedIndices) => void
    isCursorOnIndexGetter: (optionIndex: SelectedIndices) => boolean
    highlight: (data?: string | number) => string[]
    select: () => void
    nextPage: () => void
  }

  const props = defineProps<Props>()

  const { t } = useI18n()

  const selectIndex = (optionIndex: SelectedIndices) => {
    props.setCursorIndex(optionIndex)
    props.select()
  }

  const dropLoader = ref<HTMLElement | undefined>()
  useIntersectionObserver(dropLoader, ([{ isIntersecting }]) => {
    if (!isIntersecting || props.isLoading) return
    props.nextPage()
  })
</script>

<template>
  <div
    class="px-3 py-2 text-theme bg-white"
    role="listbox"
    :ariaMultiselectable="multiple ? 'true' : 'false'"
  >
    <template v-if="isLoading || filteredOptions.length > 0">
      <div
        v-if="grouping"
        :class="{ 'sm:flex sm:gap-3': groupsHorisontal }"
      >
        <template
          v-for="(group, groupIndex) in filteredOptionsGrouped"
          :key="group.key"
        >
          <div class="w-full">
            <NatInputSelectMenuItem
              v-if="showGroupText"
              :text="groupTextGetter!(group.items[0])"
              :multiple="multiple"
              :isSelected="isSelectedGroupGetter(group)"
              :isDisabled="isDisabledGroupGetter(group)"
              :isCursorOn="isCursorOnIndexGetter({ groupIndex })"
              :highlight="highlight"
              isGroup
              @pointerdown="allowSelectGroups && selectIndex({ groupIndex, optionIndex: undefined })"
              @mousemove="allowSelectGroups && setCursorIndex({ groupIndex, optionIndex: undefined })"
            />
            <NatInputSelectMenuItem
              v-for="(option, optionIndex) in group.items"
              :key="keyGetter(option)"
              :text="textGetter(option)"
              :multiple="multiple"
              :isSelected="isSelectedGetter(option)"
              :isDisabled="isDisabledGetter(option)"
              :isCursorOn="isCursorOnIndexGetter({ groupIndex, optionIndex })"
              :highlight="highlight"
              @pointerdown="selectIndex({ groupIndex, optionIndex })"
              @mousemove="setCursorIndex({ groupIndex, optionIndex })"
            />
          </div>
          <div
            class="border-color-substrate justify-self-stretch not-last:border-b-1"
            :class="{ 'sm:not-last:border-r-1' : groupsHorisontal }"
          />
        </template>
      </div>
      <template v-else>
        <NatInputSelectMenuItem
          v-for="(option, optionIndex) in filteredOptions"
          :key="keyGetter(option)"
          :text="textGetter(option)"
          :icon="iconGetter?.(option)"
          :multiple="multiple"
          :isSelected="isSelectedGetter(option)"
          :isDisabled="isDisabledGetter(option)"
          :isCursorOn="isCursorOnIndexGetter({ optionIndex })"
          :highlight="highlight"
          @pointerdown="selectIndex({ optionIndex })"
          @mousemove="setCursorIndex({ optionIndex })"
        />
      </template>
      <div
        v-if="!isFullyVisible"
        ref="dropLoader"
        class="px-3 py-2 break-all"
      >
        <NatSpinner
          size="1.5em"
          class="text-primary"
        />
      </div>
    </template>
    <div
      v-else
      class="px-3 py-2"
    >
      <slot
        name="emptyList"
        :query="query"
        :total="activeTotal"
      >
        <div v-if="activeTotal === 0">
          {{ query ? t('select.nothing-found') : t('select.list-is-empty') }}
        </div>
        <div v-else>
          {{ t('select.type-to-search') }}
        </div>
      </slot>
    </div>
  </div>
</template>
