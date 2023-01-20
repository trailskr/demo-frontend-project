<script setup lang="ts">
  const semanticsList = ['primary', 'secondary', 'accent', 'link', 'substrate', 'danger', 'emphasis'] as const
  const variants = ['solid', 'outline'] as const

  const value = ref<number>()
  const toggle = (number: number) => {
    value.value = number === value.value ? undefined : number
  }
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="variant in variants"
      :key="variant"
      class="flex gap-4"
    >
      <NatButton
        v-for="semantics in semanticsList"
        :key="semantics"
        :semantics="semantics"
        :variant="variant"
        :label="semantics"
      />
    </div>
    <div
      v-for="variant in variants"
      :key="variant"
      class="flex gap-4"
    >
      <NatButton
        v-for="semantics in semanticsList"
        :key="semantics"
        :semantics="semantics"
        :variant="variant"
        :label="semantics"
        loading
      />
    </div>
    <div
      v-for="variant in variants"
      :key="variant"
      class="flex gap-4"
    >
      <NatButton
        v-for="semantics in semanticsList"
        :key="semantics"
        class="p-3"
        :semantics="semantics"
        :variant="variant"
        :label="semantics"
        rounded
        :padding="false"
      >
        <IconUilUser />
      </NatButton>
    </div>
    <div
      v-for="variant in variants"
      :key="variant"
      class="flex gap-4"
    >
      <NatButton
        v-for="semantics in semanticsList"
        :key="semantics"
        :semantics="semantics"
        :variant="variant"
        :label="semantics"
        disabled
      />
    </div>
    <div>value: {{ value }}</div>
    <div
      v-for="semantics in semanticsList"
      :key="semantics"
      class="flex flex-col gap-2"
    >
      <div
        v-for="variant in variants"
        :key="variant"
        class="flex gap-4"
      >
        <NatButtonGroup
          :semantics="semantics"
          :variant="variant"
        >
          <NatButton
            v-for="number in 3"
            :key="number"
            :semantics="semantics"
            :variant="variant"
            :label="`${semantics} #${number}`"
            :active="value === number"
            @click="toggle(number)"
          />
        </NatButtonGroup>
      </div>
    </div>
  </div>
</template>
