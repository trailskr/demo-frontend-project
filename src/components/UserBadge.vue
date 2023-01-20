<script setup lang="ts">
  import { UserInfo } from '@/api/apiTypes'

  interface Props {
    modelValue: Pick<UserInfo, 'image' | 'firstName'> & Partial<Pick<UserInfo, 'lastName'>>
    color?: string
  }

  defineProps<Props>()
</script>

<template>
  <div class="rounded-5px bg-emphasis bg-opacity-10 inline-flex items-center p-3px">
    <UserAvatar
      :modelValue="modelValue"
      :color="color"
      titleClass="text-3"
      class="w-6.5 h-6.5"
    />
    <div class="text-3.5 font-semibold px-6px whitespace-nowrap">
      {{ modelValue.firstName }} {{ modelValue.lastName }}
    </div>
  </div>
</template>
