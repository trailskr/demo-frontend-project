<script setup lang="ts">
  import IconUilAngleDown from '~icons/uil/angle-down'
  import IconUilUser from '~icons/uil/user'

  const tab = ref('one')
  const tabs = [{
    id: 'one',
    name: 'One',
    icon: IconUilAngleDown
  }, {
    id: 'two',
    name: 'Two',
    icon: IconUilUser
  }, {
    id: 'three',
    name: 'Three',
    disabled: true
  }]
</script>

<template>
  <div class="container mx-auto py-2 space-y-4">
    <div class="space-y-4">
      <NatTabs
        v-model="tab"
        :tabs="tabs"
        semantics="header"
      />
      <NatTabs
        v-model="tab"
        :tabs="tabs"
      />
      <NatTabs
        v-model="tab"
        :tabs="tabs"
        semantics="primary"
      />
    </div>
  </div>
</template>
