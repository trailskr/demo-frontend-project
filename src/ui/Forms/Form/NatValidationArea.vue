<script setup lang="ts">
  import { Validation } from '@/utils/Validation'

  interface Props {
    validation: Validation
    selfErrors?: boolean
  }

  const props = defineProps<Props>()

  const isInvalid = computed(() => props.selfErrors
    ? props.validation.isSelfInvalid
    : props.validation.isInvalid)

  const errors = computed(() => props.selfErrors
    ? props.validation.selfErrors.map((err) => err.message)
    : props.validation.errors.map((err) => err.message))
</script>

<template>
  <div
    class="transition"
    :class="{ 'text-danger relative my-2': isInvalid }"
  >
    <span
      v-if="isInvalid"
      class="transition absolute -inset-1 pointer-events-none border-1 border-danger rounded-5px"
    />
    <slot />
    <div
      v-if="isInvalid"
      class="text-3 text-danger pl-1 pt-1"
    >
      {{ errors[0] }}
    </div>
  </div>
</template>
