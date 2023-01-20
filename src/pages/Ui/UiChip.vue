<script setup lang="ts">
  const onChipClose = () => alert('chip close')
</script>

<template>
  <div class="space-x-2">
    <NatChip
      label="Default chip"
    />
    <NatChip
      label="Primary closable chip"
      semantics="primary"
      closable
      @close="onChipClose"
    />
  </div>
</template>
