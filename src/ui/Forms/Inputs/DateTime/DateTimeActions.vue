<script setup lang="ts">
  type Emits = {
    (e: 'cancel'): void
    (e: 'clear'): void
    (e: 'save'): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()
</script>

<template>
  <div class="flex justify-end gap-2">
    <NatButton
      class="w-8 h-8 mr-auto border-danger border-1"
      semantics="secondary"
      @click="emit('clear')"
    >
      <IconMdiTrashCanOutline class="w-5 h-5 text-danger" />
    </NatButton>
    <NatButton
      class="h-8 text-3.5"
      semantics="substrate"
      @click="emit('cancel')"
    >
      {{ t('cancel') }}
    </NatButton>
    <NatButton
      class="h-8 text-3.5"
      semantics="accent"
      @click="emit('save')"
    >
      {{ t('save') }}
    </NatButton>
  </div>
</template>
