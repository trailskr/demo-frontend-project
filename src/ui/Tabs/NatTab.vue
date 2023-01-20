<script setup lang="ts">
  import { TemplateRefsList } from '@vueuse/core'

  import { NatTab } from './tabs'

  type Type = 'link' | 'default'
  type Semantics = 'header' | 'default' | 'primary'

  interface Props {
    modelValue: NatTab
    type?: Type
    href?: string
    isActive: boolean
    semantics?: Semantics
    indicators: TemplateRefsList<Element>
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'default',
    semantics: 'default'
  })

  const semanticTabInactiveClasses: Record<Semantics, string> = {
    header: 'text-secondary cursor-pointer px-2',
    default: 'text-secondary cursor-pointer',
    primary: 'text-secondary cursor-pointer rounded-t-5px'
  }

  const semanticTabDisabledClasses: Record<Semantics, string> = {
    header: 'cursor-not-allowed text-opacity-40 px-2',
    default: 'cursor-not-allowed text-opacity-40',
    primary: 'cursor-not-allowed text-opacity-40'
  }

  const semanticTabActiveClasses: Record<Semantics, string> = {
    header: 'text-main cursor-pointer px-2',
    default: 'text-primary cursor-pointer',
    primary: 'text-primary cursor-pointer'
  }

  const semanticsTabClass = computed(() => {
    return props.modelValue.disabled
      ? semanticTabDisabledClasses[props.semantics]
      : props.isActive
        ? semanticTabActiveClasses[props.semantics]
        : semanticTabInactiveClasses[props.semantics]
  })

  const semanticTabContentClasses: Record<Semantics, string> = {
    header: 'h-18.75',
    default: 'px-3 h-11',
    primary: 'px-3 h-14'
  }

  const semanticsTabContentClass = computed(() => semanticTabContentClasses[props.semantics])

  const innerUnderlineBySemantics: Record<Semantics, boolean> = {
    header: true,
    default: false,
    primary: false
  }

  const innerUnderline = computed(() => innerUnderlineBySemantics[props.semantics])

  const semanticUnderlineClasses: Record<Semantics, string> = {
    header: '-inset-1px border-primary border-b-2 bg-primary bg-opacity-5',
    default: '-inset-1px border-primary border-b-1 bg-primary bg-opacity-5',
    primary: '-inset-1px bg-substrate rounded-t-5px -z-1'
  }

  const semanticsUnderlineClass = computed(() => semanticUnderlineClasses[props.semantics])

  const stateHelperClasses: Record<Semantics, string> = {
    header: 'group_tabs-hover:bg-opacity-2 group_tabs-hover:bg-black',
    default: 'group_tabs-hover:bg-opacity-2 group_tabs-hover:bg-black',
    primary: 'group_tabs-hover:bg-opacity-2 group_tabs-hover:bg-black rounded-t-5px'
  }

  const stateHelperDisabledClasses: Record<Semantics, string> = {
    header: 'bg-opacity-20 bg-black',
    default: 'bg-opacity-20 bg-black',
    primary: 'bg-opacity-20 bg-black rounded-t-5px'
  }

  const stateHelperClass = computed(() => {
    return props.modelValue.disabled
      ? stateHelperDisabledClasses[props.semantics]
      : stateHelperClasses[props.semantics]
  })
</script>

<template>
  <Component
    :is="type === 'link' ? 'a' : 'div'"
    role="tab"
    :href="type === 'link' ? href : null"
    class="flex-auto flex items-center justify-center relative group_tabs transition hover:text-main"
    :class="semanticsTabClass"
  >
    <div
      class="transition absolute inset-0 pointer-events-none"
      :class="stateHelperClass"
    />
    <div
      v-if="!innerUnderline"
      :ref="indicators.set"
      class="absolute pointer-events-none"
      :class="[semanticsUnderlineClass, {'opacity-0': !isActive}]"
    />
    <div
      class="flex items-center justify-center gap-3 relative w-full"
      :class="semanticsTabContentClass"
    >
      <Component
        :is="modelValue.icon"
        v-if="modelValue.icon"
        :class="isActive ? 'text-primary' : ''"
        class="z-1"
      />
      <Component
        :is="modelValue.component"
        v-bind="modelValue.componentProps"
        v-if="modelValue.component"
        :tab="modelValue"
      >
        {{ modelValue.name }}
      </Component>
      <div
        v-else
        class="z-1"
      >
        {{ modelValue.name }}
      </div>
      <div
        v-if="innerUnderline"
        :ref="indicators.set"
        class="absolute pointer-events-none"
        :class="[semanticsUnderlineClass, {'opacity-0': !isActive}]"
      />
    </div>
  </Component>
</template>
