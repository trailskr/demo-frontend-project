<script setup lang="ts">
  interface Props {
    active?: boolean
  }

  defineProps<Props>()
</script>

<template>
  <NatButton
    class="w-11.5 h-11.5"
    semantics="link"
    :padding="false"
  >
    <span class="block h-6 w-6 relative text-primary">
      <span
        class="absolute block h-0.5 w-6 bg-current rounded-full transition-all origin-left"
        :class="active ? 'left-0 top-1.5 rotate-45 -translate-y-0.625 translate-x-0.625' : 'left-0 top-1.5'"
      />
      <span
        class="absolute block h-0.5 bg-current rounded-full transition-all origin-left group_button-hover:w-6"
        :class="active ? 'left-0 top-4.5 w-6 -rotate-45 translate-y-0.625 translate-x-0.625' : 'left-0 top-4.5 w-4'"
      />
    </span>
  </NatButton>
</template>
