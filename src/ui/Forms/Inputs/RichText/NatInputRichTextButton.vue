<script setup lang="ts">
  interface Props {
    tooltipText: string
    keysPc?: string[]
    keysMac?: string[]
  }

  defineProps<Props>()
</script>

<script lang="ts">
  export default defineComponent({
    inheritAttrs: false
  })
</script>

<template>
  <NatTooltip>
    <template #reference="{ ref, popoverId }">
      <NatButton
        :ref="ref"
        v-bind="$attrs"
        :aria-describedby="popoverId"
        semantics="link"
        :padding="false"
        class="w-6 h-6 sm:w-8 sm:h-8"
      >
        <slot />
      </NatButton>
    </template>
    <div class="inline-flex items-center gap-2">
      {{ tooltipText }}
      <NatKeyShortcut
        v-if="keysPc && keysMac"
        plusClass="text-white"
        :pc="keysPc"
        :mac="keysMac"
      />
    </div>
  </NatTooltip>
</template>
