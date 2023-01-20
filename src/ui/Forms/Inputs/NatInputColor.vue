<script setup lang="ts">
  interface Props {
    modelValue?: string
    disabled?: boolean
    allowOpacityChange?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)
</script>

<script lang="ts">
  export default defineComponent({
    name: 'NatAside',
    inheritAttrs: false
  })
</script>

<template>
  <NatDropdown>
    <template #reference="{ toggle, ref }">
      <NatColorView
        v-bind="$attrs"
        :ref="ref"
        :class="{ 'cursor-pointer': !disabled }"
        :modelValue="modelValue"
        @click="!disabled && toggle()"
      />
    </template>

    <div class="rounded-5px bg-white m-5">
      <NatColorPicker
        v-model="value"
        :allowOpacityChange="allowOpacityChange"
      >
        <slot />
      </NatColorPicker>
    </div>
  </NatDropdown>
</template>
