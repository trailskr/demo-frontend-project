<script setup lang="ts">
  interface Props {
    header?: string
    showHeader?: boolean
    showCloseButton?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showHeader: true,
    showCloseButton: true
  })

  interface Emits {
    (e: 'close'): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()
</script>

<template>
  <div
    class="overflow-auto rounded-5px bg-white m-8"
    style="max-height: calc(100vh - 2rem)"
  >
    <div class="flex items-start px-9 pt-6 pb-2">
      <slot
        v-if="showHeader"
        name="header"
      >
        <div class="text-9 hidden sm:block font-semibold">
          {{ props.header }}
        </div>
      </slot>
      <div class="flex-auto" />
      <NatButton
        v-if="showCloseButton"
        tabindex="-1"
        class="ml-4 -mr-4 w-9 h-9 shrink-0"
        semantics="link"
        rounded
        :padding="false"
        :title="t('to-close')"
        @click="emit('close')"
      >
        <IconMdiCloseThick />
      </NatButton>
    </div>
    <slot />
  </div>
</template>
