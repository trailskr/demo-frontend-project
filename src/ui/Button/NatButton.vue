<script setup lang="ts">
  import { Semantics, Variant } from './button'

  interface Props {
    type?: 'submit' | 'reset' | 'button' | 'link'
    href?: string
    semantics?: Semantics
    variant?: Variant
    label?: string
    disabled?: boolean
    rounded?: boolean
    active?: boolean
    padding?: boolean
    loading?: boolean
    buttonClass?: string
    helperClass?: string
    helperDisabledClass?: string
    compact?: boolean
    textWrap?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'button',
    semantics: 'accent',
    variant: 'solid',
    padding: true,
    active: false,
    textWrap: false
  })

  const buttonGroupRoundedClasses = [
    'group_buttonGroup:rounded-0',
    '!group_buttonGroup:first:rounded-l-5px',
    '!group_buttonGroup:last:rounded-r-5px'
  ]

  const buttonGroupInnerRoundedClasses = [
    'group_button:group_buttonGroup:rounded-0',
    '!group_button-first:group_buttonGroup:rounded-l-5px',
    '!group_button-last:group_buttonGroup:rounded-r-5px'
  ]

  const roundedClass = computed(() => (props.rounded ? 'rounded-full' : ['rounded-5px', ...buttonGroupRoundedClasses]))
  const roundedInnerClass = computed(() => (props.rounded ? 'rounded-full' : ['rounded-5px', ...buttonGroupInnerRoundedClasses]))

  const semanticClasses: Record<Variant, Record<Semantics, string>> = {
    solid: {
      accent: 'bg-accent text-white',
      primary: 'bg-primary text-white',
      substrate: 'bg-emphasis bg-opacity-10 text-primary',
      emphasis: 'bg-emphasis text-primary text-white',
      secondary: 'border-1 border-substrate group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 bg-white text-secondary',
      link: 'bg-transparent text-secondary',
      danger: 'bg-danger text-white'
    },
    outline: {
      accent: 'border-1 border-accent group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-accent',
      primary: 'border-1 border-primary group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-primary',
      substrate: 'border-1 bg-emphasis bg-opacity-10 border-primary group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-primary',
      emphasis: 'border-1 border-emphasis group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-emphasis',
      secondary: 'border-1 border-secondary group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-secondary',
      link: 'border-1 bg-transparent border-secondary group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-secondary',
      danger: 'border-1 border-danger group_buttonGroup:border-0 group_buttonGroup:not-first:border-l-1 text-danger'
    }
  }

  const semanticsClass = computed(() => {
    return props.buttonClass ?? semanticClasses[props.variant][props.semantics]
  })

  const disabledState = computed(() => !!props.disabled || !!props.loading)

  const stateHelperClasses: Record<Variant, Record<Semantics, string>> = {
    solid: {
      accent: 'group_button-hover:bg-opacity-20 group_button-hover:bg-white',
      primary: 'group_button-hover:bg-opacity-30 group_button-hover:bg-white',
      substrate: 'group_button-hover:bg-opacity-10 group_button-hover:bg-gray',
      emphasis: 'group_button-hover:bg-opacity-10 group_button-hover:bg-gray',
      link: 'group_button-hover:bg-opacity-5 dark:group_button-hover:bg-opacity-10 group_button-hover:bg-primary dark:group_button-hover:bg-light',
      secondary: 'group_button-hover:bg-opacity-10 group_button-hover:bg-gray',
      danger: 'group_button-hover:bg-opacity-20 group_button-hover:bg-white'
    },
    outline: {
      accent: '',
      primary: '',
      substrate: '',
      emphasis: '',
      secondary: '',
      link: 'group_button-hover:bg-opacity-5 dark:group_button-hover:bg-opacity-10 group_button-hover:bg-primary dark:group_button-hover:bg-light',
      danger: ''
    }
  }

  const stateHelperDisabledClasses: Record<Variant, Record<Semantics, string>> = {
    solid: {
      accent: 'bg-opacity-30 bg-white',
      substrate: 'bg-opacity-20 bg-black',
      emphasis: 'bg-opacity-20 bg-black',
      primary: 'bg-opacity-30 bg-white',
      link: '',
      secondary: '',
      danger: 'bg-opacity-30 bg-white'
    },
    outline: {
      accent: '',
      primary: '',
      substrate: '',
      emphasis: '',
      secondary: '',
      link: '',
      danger: ''
    }
  }

  const stateHelperClass = computed(() => {
    return props.helperClass
      ? disabledState.value
        ? props.helperDisabledClass ?? ''
        : props.helperClass
      : disabledState.value
        ? stateHelperDisabledClasses[props.variant][props.semantics]
        : stateHelperClasses[props.variant][props.semantics]
  })

  const paddingClasses = computed(() => {
    if (!props.padding) return null

    return props.compact ? 'px-3 py-1.25' : 'px-4 py-2.75'
  })
</script>

<template>
  <Component
    :is="type === 'link' ? 'a' : 'button'"
    :type="type !== 'link' ? type : null"
    :href="type === 'link' ? href : null"
    class="inline-flex transition group_button relative focus-visible:outline-none focus:outline-none focus-visible:ring-2 ring-primary ring-offset-2 items-center justify-center active:shadow-inbtn focus:z-1"
    :class="[
      semanticsClass, roundedClass,
      {
        'hover:shadow-btn': !disabled && !loading && (semantics !== 'link' || variant === 'outline'),
        'cursor-not-allowed': disabled,
        'opacity-50': disabledState
      },
      active && (semantics === 'link' && variant !== 'outline' ? '!bg-emphasis !bg-opacity-10' : 'shadow-inbtn')
    ]"
    :disabled="disabledState"
    :label="label"
  >
    <span
      class="transition absolute inset-0 pointer-events-none"
      :class="[stateHelperClass, roundedInnerClass]"
    />
    <span
      class="flex-auto block flex items-center justify-center font-medium font-semibold transition duration-150 ease-in-out"
      :class="[roundedInnerClass, paddingClasses]"
    >
      <NatSpinner
        v-if="loading"
        class="absolute mx-auto"
      />
      <span
        class="flex-auto flex items-center justify-center"
        :class="{ 'text-transparent': loading, 'whitespace-nowrap': !textWrap }"
      >
        <slot>{{ label }}</slot>
      </span>
    </span>
  </Component>
</template>
