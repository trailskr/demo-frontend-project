<script setup lang="ts">
  const round = Math.round

  const width = 1200
  const height = 600
  const scrollWidth = 3000
  const scrollHeight = 6000
  const left = ref(0)
  const top = ref(0)
  const right = computed(() => left.value + width)
  const bottom = computed(() => top.value + height)
</script>

<template>
  <div class="container py-2 space-y-4">
    <div class="mx-auto">
      <h2>NatScrollbars</h2>
      <NatScrollbars
        v-model:left="left"
        v-model:top="top"
        :style="{ width: `${width}px`, height: `${height}px` }"
        :scrollWidth="scrollWidth"
        :scrollHeight="scrollHeight"
        :clampShift="300"
      >
        <div class="bg-gradient-to-br w-full h-full from-green-400 to-blue-500 p-10">
          <div class="grid grid-cols-4 w-max gap-1">
            <div>width: </div><div>{{ width }}</div><div>height: </div><div>{{ height }}</div>
            <div>scrollWidth: </div><div>{{ scrollWidth }}</div><div>scrollHeight: </div><div>{{ scrollHeight }}</div>
            <div>width: </div><div>{{ width }}</div><div>height: </div><div>{{ height }}</div>
            <div>left: </div><div>{{ round(left) }}</div><div>right: </div><div>{{ round(right) }}</div>
            <div>top: </div><div>{{ round(top) }}</div><div>bottom: </div><div>{{ round(bottom) }}</div>
          </div>
        </div>
      </NatScrollbars>
    </div>
    <div class="mx-auto">
      <h2>NatScroll</h2>
      <NatScroll :style="{ width: `${width}px`, height: `${height}px` }">
        <div
          class="bg-gradient-to-br w-full h-full from-green-400 to-blue-500 p-10"
          :style="{ width: `${scrollWidth}px`, height: `${scrollHeight}px` }"
        />
      </NatScroll>
    </div>
  </div>
</template>
