<script setup lang="ts">
  const logDrop = (...args: any[]) => {
    console.log('drop', ...args)
  }
  const logDragOver = (...args: any[]) => {
    console.log('dragOver', ...args)
  }
  const logDragStart = (...args: any[]) => {
    console.log('dragStart', ...args)
  }
  const logDragMove = (...args: any[]) => {
    console.log('dragMove', ...args)
  }
  const logDragEnd = (...args: any[]) => {
    console.log('dragEnd', ...args)
  }
</script>

<template>
  <div class="space-y-2">
    <div class="space-y-2">
      <NatDragAndDrop
        v-slot="{ refHandler, status, positions }"
        :modelValue="1"
        canDrag
        :canDrop="(src, trg) => src !== trg"
        splitZoneHorizontally
        splitZoneVertically
        @natDrop="logDrop"
        @natDragOver="logDragOver"
        @natDragStart="logDragStart"
        @natDragMove="logDragMove"
        @natDragEnd="logDragEnd"
      >
        <pre
          :ref="refHandler"
          class="text-white cursor-pointer touch-none select-none w-120 px-6 py-3"
          :class="status.isDropPossible ? 'bg-positive' : 'bg-primary'"
        >status = {{ JSON.stringify(status, null, '  ') }}<br>positions = {{ JSON.stringify(positions, null, '  ') }}</pre>
      </NatDragAndDrop>
      <NatDragAndDrop
        v-slot="{ refHandler, status, positions }"
        canDrag
        @natDrop="logDrop"
        @natDragOver="logDragOver"
        @natDragStart="logDragStart"
        @natDragMove="logDragMove"
        @natDragEnd="logDragEnd"
      >
        <div
          :ref="refHandler"
          class=" text-white cursor-pointer touch-none select-none w-120 px-6 py-3"
          :class="status.isDropPossible ? 'bg-positive' : 'bg-secondary'"
        >
          <pre>status = {{ JSON.stringify(status, null, '  ') }}<br>positions = {{ JSON.stringify(positions, null, '  ') }}</pre>
        </div>
      </NatDragAndDrop>
    </div>
    <div class="flex space-x-2" />
    <div class="flex space-x-2" />
  </div>
</template>
