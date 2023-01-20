<script setup lang="ts">
  import { useTemplateRefsList } from '@vueuse/core'

  import { useLocalVModel } from '@/use/useLocalVModel'

  import type { NatTab } from './tabs'

  type Semantics = 'header' | 'default' | 'primary'

  interface Props {
    tabs: NatTab[]
    modelValue?: string | null
    semantics?: Semantics
  }

  const props = withDefaults(defineProps<Props>(), {
    semantics: 'default'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const value = useLocalVModel(props, 'modelValue', emit)

  const select = (tab: NatTab, callback?: () => void) => {
    value.value = tab.id
    callback?.()
  }

  const provideIsActive = (tab: NatTab, isActive: boolean): boolean => {
    if (isActive) value.value = tab.id
    return isActive
  }

  const semanticClasses: Record<Semantics, string> = {
    header: 'text-3.5 xl:text-4.5',
    default: 'text-4.5',
    primary: 'text-4.5'
  }

  const semanticsClass = computed(() => semanticClasses[props.semantics])

  const indicators = useTemplateRefsList()

  const findTabIndicatorById = (id: NatTab['id'] | undefined | null): HTMLElement | SVGElement | null | undefined => {
    const index = props.tabs.findIndex((tab) => tab.id === id)
    return indicators.value[index] as HTMLElement | SVGElement | null | undefined
  }

  const transitionDuration = 300
  const setTransform = (indicator: HTMLElement | SVGElement, transformFrom: string, transformTo: string) => {
    indicator.style.transform = transformFrom
    setTimeout(() => {
      indicator.style.transition = `transform ${transitionDuration}ms ease-in-out 0ms`
      indicator.style.transform = transformTo
      setTimeout(() => {
        indicator.removeAttribute('style')
      }, transitionDuration)
    })
  }

  watch(value, (curValue, prevValue) => {
    const indicator = findTabIndicatorById(curValue)
    if (!indicator) return
    const prevIndicator = findTabIndicatorById(prevValue)
    const rect = indicator.getBoundingClientRect()
    if (prevIndicator) {
      const prev = prevIndicator.getBoundingClientRect()
      const dx = 0.5 * (prev.left + prev.right - (rect.left + rect.right))
      const scale = prev.width / rect.width
      setTransform(indicator, `translateX(${dx}px) scaleX(${scale})`, 'translateX(0px) scaleX(1)')
    } else {
      setTransform(indicator, 'scaleX(0)', 'scaleX(1)')
    }
  })
</script>

<template>
  <div
    class="flex items-center relative font-semibold"
    :class="semanticsClass"
    role="tablist"
  >
    <slot>
      <template
        v-for="tab in tabs"
        :key="tab.id"
      >
        <RouterLink
          v-if="tab.to"
          v-slot="{ navigate, href, isActive, isExactActive }"
          :to="tab.to"
          custom
        >
          <NatTab
            type="link"
            :href="href"
            :modelValue="tab"
            :semantics="semantics"
            :indicators="indicators"
            :isActive="provideIsActive(tab, tab.exactRouteMatch ? isExactActive : isActive)"
            @click.prevent="!tab.disabled && select(tab, navigate)"
          />
        </RouterLink>
        <NatTab
          v-else
          :modelValue="tab"
          :semantics="semantics"
          :indicators="indicators"
          :isActive="value === tab.id"
          @click="!tab.disabled && select(tab)"
        />
      </template>
    </slot>
  </div>
</template>
