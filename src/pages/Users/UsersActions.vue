<script setup lang="ts">

  import { UserInfo } from '@/api/apiTypes'

  interface Props {
    modelValue: UserInfo
  }

  defineProps<Props>()

  interface Emits {
    (e: 'edit', value: UserInfo): void
    (e: 'delete', value: UserInfo): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()
</script>

<template>
  <div class="flex items-center">
    <ActionButton
      :label="t('edit')"
      @click="emit('edit', modelValue)"
    >
      <IconMdiAccountEditOutline />
    </ActionButton>
    <ActionButton
      :label="t('to-delete')"
      @click="emit('delete', modelValue)"
    >
      <IconMdiTrashCanOutline />
    </ActionButton>
  </div>
</template>
