<script setup lang="ts">
  import { RouteLocationRaw } from 'vue-router'

  interface Props {
    to?: RouteLocationRaw
    label: string
    disabledLabel?: string
    disabled?: boolean
  }

  const props = defineProps<Props>()

  const stateLabel = computed(() => props.disabled ? props.disabledLabel : props.label)
</script>

<script lang="ts">
  export default defineComponent({
    inheritAttrs: false
  })
</script>

<template>
  <RouterLink
    v-if="to"
    v-slot="{ navigate, href }"
    :to="to"
    custom
  >
    <NatTooltip>
      <template #reference="{ ref, popoverId }">
        <NatButton
          v-bind="$attrs"
          :ref="ref"
          :padding="false"
          :disabled="disabled"
          :aria-describedby="popoverId"
          class="w-11.5 h-11.5"
          semantics="link"
          type="link"
          :href="href"
          :label="stateLabel"
          @click.prevent="!disabled && navigate()"
        >
          <slot />
        </NatButton>
      </template>
      {{ stateLabel }}
    </NatTooltip>
  </RouterLink>
  <NatTooltip v-else>
    <template #reference="{ ref, popoverId }">
      <NatButton
        v-bind="$attrs"
        :ref="ref"
        :padding="false"
        :disabled="disabled"
        :aria-describedby="popoverId"
        class="w-11.5 h-11.5"
        semantics="link"
        :label="stateLabel"
      >
        <slot />
      </NatButton>
    </template>
    {{ stateLabel }}
  </NatTooltip>
</template>
