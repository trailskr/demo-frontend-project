<script setup lang="ts">
  const inputsTab = useRouteQuery<string | null>('inputsTab', 'text')
</script>

<template>
  <div>
    <NatTabs
      v-model="inputsTab"
      :tabs="[{
        id: 'text',
        name: 'Text'
      }, {
        id: 'rich-text',
        name: 'RichText'
      }, {
        id: 'number',
        name: 'Number'
      }, {
        id: 'date',
        name: 'Date'
      }, {
        id: 'select',
        name: 'Select'
      }, {
        id: 'checkbox',
        name: 'Checkbox'
      }, {
        id: 'radio',
        name: 'Radio'
      }, {
        id: 'switch',
        name: 'Switch'
      }, {
        id: 'range',
        name: 'Range'
      }]"
    />
    <section class="pt-2">
      <NatFadeTransition>
        <UiInputsText v-if="inputsTab === 'text'" />
        <UiInputsRichText v-else-if="inputsTab === 'rich-text'" />
        <UiInputsNumber v-else-if="inputsTab === 'number'" />
        <UiInputsDate v-else-if="inputsTab === 'date'" />
        <UiInputsSelect v-else-if="inputsTab === 'select'" />
        <UiInputsCheckbox v-else-if="inputsTab === 'checkbox'" />
        <UiInputsRadio v-else-if="inputsTab === 'radio'" />
        <UiInputsSwitch v-else-if="inputsTab === 'switch'" />
        <UiInputsRange v-else-if="inputsTab === 'range'" />
      </NatFadeTransition>
    </section>
  </div>
</template>
