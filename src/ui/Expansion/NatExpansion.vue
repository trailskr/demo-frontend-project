<script setup lang="ts">
  import { useLocalVModel } from '@/use/useLocalVModel'

  import { getExpansionId, useExpansion, Semantics } from './expansion'

  interface Props {
    modelValue?: boolean
    label?: string | null
    disabled?: boolean
    semantics?: Semantics
    headerClass?: string
    contentClass?: string
    buttonClass?: string
    showContent?: boolean
    showToggleButton?: boolean
    showLabel?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    label: '',
    disabled: false,
    showContent: true,
    showToggleButton: true,
    showLabel: true,
    semantics: 'default'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const semanticClasses: Record<Semantics, string> = {
    default: 'bg-white',
    emphasis: 'bg-emphasis bg-opacity-10'
  }

  const semanticsClass = computed(() => {
    return semanticClasses[props.semantics]
  })

  const headerClasses = computed(() => [semanticsClass, { 'rounded-b-0': isOpen }, props.headerClass])
  const contentClasses = computed(() => [semanticsClass, { 'rounded-t-0': isOpen }, props.contentClass])

  const emit = defineEmits<Emits>()

  const isOpen = useLocalVModel(props, 'modelValue', emit, { defaultValue: false })

  const close = () => { isOpen.value = false }

  const expansion = { id: getExpansionId(), close }

  const open = () => {
    isOpen.value = true
    if (expansionGroup) expansionGroup.onOpen(expansion)
  }

  const expansionGroup = useExpansion(expansion)

  const toggle = () => {
    if (props.disabled) return
    if (isOpen.value) close()
    else open()
  }
</script>

<template>
  <div>
    <div
      class="transition flex items-center"
      :class="headerClasses"
    >
      <slot
        v-if="showLabel"
        name="label"
        v-bind="props"
      >
        <div
          class="flex-auto font-semibold text-main"
          :class="{ 'text-opacity-40': disabled }"
        >
          {{ label }}
        </div>
      </slot>
      <slot
        v-if="showContent && showToggleButton"
        name="button"
        v-bind="{ ...props, isOpen, toggle }"
      >
        <NatButton
          semantics="link"
          :padding="false"
          class="h-8 w-8 flex-shrink-0"
          :class="buttonClass"
          :disabled="disabled"
          @click="toggle"
        >
          <IconUilAngleDown
            class="transform transition-transform"
            :class="{ 'rotate-180': isOpen }"
          />
        </NatButton>
      </slot>
    </div>
    <NatExpandBottomTransition v-if="showContent">
      <div
        v-if="isOpen"
        :class="contentClasses"
      >
        <slot />
      </div>
    </NatExpandBottomTransition>
  </div>
</template>
