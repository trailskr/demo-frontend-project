<script setup lang="ts">
  const tab = useRouteQuery<string | null>('tab', 'buttons')
</script>

<template>
  <div class="container mx-auto py-2 space-y-4">
    <NatTabs
      v-model="tab"
      :tabs="[{
        id: 'buttons',
        name: 'Buttons'
      }, {
        id: 'expansions',
        name: 'Expansions'
      }, {
        id: 'inputs',
        name: 'Inputs'
      }, {
        id: 'spinner',
        name: 'Spinner'
      }, {
        id: 'alert',
        name: 'Alert'
      }, {
        id: 'tabs',
        name: 'Tabs'
      }, {
        id: 'dragAndDrop',
        name: 'Drag and drop'
      }, {
        id: 'scroll',
        name: 'Scroll'
      }, {
        id: 'chip',
        name: 'Chip'
      }]"
    />
    <section class="pt-2">
      <NatFadeTransition>
        <UiButtons v-if="tab === 'buttons'" />
        <UiExpansion v-else-if="tab === 'expansions'" />
        <UiInputs v-else-if="tab === 'inputs'" />
        <UiSpinner v-else-if="tab === 'spinner'" />
        <UiAlert v-else-if="tab === 'alert'" />
        <UiTabs v-else-if="tab === 'tabs'" />
        <UiDragAndDrop v-else-if="tab === 'dragAndDrop'" />
        <UiScroll v-else-if="tab === 'scroll'" />
        <UiChip v-else-if="tab === 'chip'" />
      </NatFadeTransition>
    </section>
  </div>
</template>
