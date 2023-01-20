<script setup lang="ts">
  const route = useRoute()
</script>

<template>
  <RouterView :key="route.name!" />
</template>
