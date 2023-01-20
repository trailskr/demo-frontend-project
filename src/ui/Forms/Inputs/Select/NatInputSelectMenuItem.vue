<script setup lang="ts">
  interface Props {
    text: string
    multiple: boolean
    isGroup?: boolean
    isSelected?: boolean
    isDisabled?: boolean
    isCursorOn: boolean
    highlight: (data?: string | number) => string[]
    icon?: any
  }

  defineProps<Props>()
</script>

<template>
  <div
    class="py-1 break-all relative"
    :class="[
      isDisabled ? 'cursor-not-allowed text-opacity-50' : 'cursor-pointer',
      isSelected ? 'text-primary' : 'text-main',
      multiple ? 'px-1' : 'px-3',
      isGroup ? 'font-semibold' : 'font-normal'
    ]"
    :ariaSelected="isSelected"
    role="option"
  >
    <NatCheckbox
      v-if="multiple"
      :modelValue="isSelected === true"
      :indeterminate="isSelected === undefined"
    />
    <div class="inline-flex items-center">
      <Component
        :is="icon"
        v-if="icon"
        class="inline-block mr-2"
      />
      <Component
        :is="partIndex % 2 === 0 ? 'span' : 'strong'"
        v-for="(part, partIndex) in highlight(text)"
        :key="partIndex"
      >
        {{ part }}
      </Component>
    </div>
    <div
      v-if="isCursorOn"
      class="bg-primary pointer-events-none inset-0 absolute"
      :class="isDisabled ? 'bg-opacity-5' : 'bg-opacity-10'"
    />
  </div>
</template>
