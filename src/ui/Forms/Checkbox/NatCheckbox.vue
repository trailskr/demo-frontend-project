<script setup lang="ts">
  import { Ref } from 'vue'

  import { getFieldId } from '../Form/field'

  interface Props {
    modelValue?: boolean | null
    indeterminate?: boolean
    label?: string
    disabled?: boolean
    labelLeft?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false as boolean
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: boolean): void
  }

  const emit = defineEmits<Emits>()

  const inputRef = ref<HTMLInputElement>()

  const isFocused = ref(false)
  const isFocusedVisible = computed(() => isFocused.value ? inputRef.value?.matches(':focus-visible') : false)

  watchEffect(() => {
    if (!inputRef.value) return
    inputRef.value.indeterminate = props.indeterminate === true
  })

  const isChecked = useVModel(props, 'modelValue', emit, { defaultValue: false }) as Ref<boolean>
  const hasChecked = computed(() => isChecked.value || props.indeterminate)

  const id = getFieldId()

  const preventNotInput = (e: MouseEvent) => {
    if (e.target !== inputRef.value) e.stopPropagation()
  }
</script>

<template>
  <label
    class="inline-flex items-center cursor-pointer transition group_checkbox relative shrink-0"
    :class="{ 'cursor-not-allowed text-opacity-40': disabled }"
    :for="id"
    @click="preventNotInput"
  >
    <div
      v-if="labelLeft"
      class="text-theme"
    ><slot>{{ label }}</slot></div>
    <div
      class="flex text-white items-center justify-center w-10 h-10 rounded-full select-none transition group_checkbox-hover:bg-opacity-2.5 group_checkbox-hover:bg-black shrink-0"
      :class="{ 'group_checkbox-hover:bg-transparent': disabled }"
    >
      <div
        class="flex items-center justify-center w-4 h-4 transition border-1 rounded-3px"
        :class="{
          'border-accent bg-accent': hasChecked,
          'bg-white': !hasChecked,
          'border-substrate': !hasChecked,
          'opacity-40': disabled,
          'ring-2 ring-offset-2 ring-primary': isFocusedVisible
        }"
        @click.stop=""
      >
        <svg
          class="w-2.5 h-2.5 fill-none stroke-current stroke-4"
          viewBox="0 0 24 24"
        >
          <path
            v-if="indeterminate"
            class="stroke-dash-30"
            d="M2,12.5 23,12.5"
          />
          <Transition
            v-else
            enterActiveClass="transition-all"
            enterFromClass="stroke-offset-30"
            enterToClass="stroke-offset-0"
            leaveActiveClass="transition-all"
            leaveFromClass="stroke-offset-0"
            leaveToClass="stroke-offset-30"
          >
            <path
              v-if="isChecked"
              class="stroke-dash-30"
              d="M2,12 9,19 22,5"
            />
          </Transition>
        </svg>
      </div>
    </div>
    <div
      v-if="!labelLeft"
      class="text-theme"
    ><slot>{{ label }}</slot></div>
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
