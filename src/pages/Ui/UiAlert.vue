<script setup lang="ts">
  import NatAlert from '@/ui/Alert/NatAlert.vue'

  const isVisible = ref(true)

  const show = () => {
    isVisible.value = true
  }
</script>

<template>
  <div class="space-y-2">
    <NatButton
      label="Show"
      @click="show"
    />
    <NatAlert
      semantics="info"
      message="Info"
    />
    <NatAlert
      semantics="error"
      message="Error"
      dismissable
    />
    <NatAlert
      v-model="isVisible"
      semantics="success"
      message="Success"
      :duration="3000"
      dismissable
    />
    <NatAlert
      v-model="isVisible"
      semantics="warning"
      message="Warning"
      :duration="3000"
    />
  </div>
</template>
