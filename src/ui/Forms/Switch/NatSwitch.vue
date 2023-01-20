<script setup lang="ts">
  import { Ref } from 'vue'

  import { getFieldId } from '../Form/field'

  interface Props {
    modelValue?: boolean | null
    label?: string
    disabled?: boolean
    labelLeft?: boolean
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false as boolean
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: boolean): void
  }

  const emit = defineEmits<Emits>()

  const isChecked = useVModel(props, 'modelValue', emit, { defaultValue: false }) as Ref<boolean>

  const inputRef = ref<HTMLInputElement>()

  const isFocused = ref(false)
  const isFocusedVisible = computed(() => isFocused.value ? inputRef.value?.matches(':focus-visible') : false)

  const id = getFieldId()
</script>

<template>
  <label
    class="inline-flex items-center cursor-pointer group_switch"
    :class="{ 'cursor-not-allowed opacity-40': disabled }"
    :for="id"
  >
    <div
      v-if="labelLeft"
      class="text-theme"
    >
      <slot>{{ label }}</slot>
    </div>
    <div
      class="h-6.5 w-10.5 p-0.75 rounded-full shrink-0 transition"
      :class="[
        disabled || !isChecked ? 'bg-tertiary' : 'bg-emphasis',
        { 'ring-2 ring-offset-2 ring-primary': isFocusedVisible },
        compact ? 'mr-2.5' : 'm-2.5'
      ]"
    >
      <div
        class="h-5 w-5 rounded-full bg-white relative transition-transform"
        :class="{ 'translate-x-4': isChecked }"
      >
        <div
          class="absolute -left-2.5 -top-2.5 flex text-white items-center justify-center w-10 h-10 rounded-full select-none transition group_switch-hover:bg-opacity-2.5 group_switch-hover:bg-black"
          :class="{ 'group_switch-hover:bg-transparent': disabled }"
        />
      </div>
    </div>
    <div
      v-if="!labelLeft"
      class="text-theme"
    >
      <slot>{{ label }}</slot>
    </div>
    <input
      :id="id"
      ref="inputRef"
      v-model="isChecked"
      class="opacity-0 absolute pointer-events-none"
      type="checkbox"
      :disabled="disabled"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
  </label>
</template>
