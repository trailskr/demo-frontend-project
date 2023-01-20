<script setup lang="ts">
  import { UserInfo } from '@/api/apiTypes'

  interface Props {
    modelValue?: Pick<UserInfo, 'image' | 'firstName'> & Partial<Pick<UserInfo, 'lastName'>>
    titleClass?: string
    color?: string
  }

  const props = defineProps<Props>()

  const nameParts = computed(() => props.modelValue ? props.modelValue.firstName.split(/ +/g) : [])
  const firstName = computed(() => (props.modelValue?.lastName === null ? nameParts.value[0] : props.modelValue?.firstName) ?? '')
  const lastName = computed<string>(() => props.modelValue?.lastName ?? nameParts.value[1] ?? '')

  const title = computed(() => {
    const u = props.modelValue
    return u ? `${firstName.value[0] ?? ''}${lastName.value[0] ?? ''}` : ''
  })
</script>

<template>
  <div
    class="flex items-center justify-center rounded-5px relative text-theme shrink-0"
  >
    <template v-if="modelValue?.image">
      <img
        class="object-cover"
        loading="lazy"
        :src="modelValue.image"
      >
    </template>
    <template v-else>
      <div
        class="absolute inset-0 text-white flex items-center justify-center"
        :class="[titleClass, color ? null : 'bg-primary']"
        :style="{ background: color }"
      >
        {{ title }}
      </div>
    </template>
    <div
      v-if="$slots.badge"
      class="absolute -top-5px -left-5px"
    >
      <slot firstName="badge" />
    </div>
  </div>
</template>
