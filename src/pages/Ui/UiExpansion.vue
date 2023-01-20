<script setup lang="ts">
  const semanticsList = ['default', 'emphasis'] as const
</script>

<template>
  <div class="bg-background space-y-4 p-4">
    <NatExpansionGroup
      v-for="semantics in semanticsList"
      :key="semantics"
      oneAtTime
    >
      <NatExpansion
        label="Expansion label 1"
        :semantics="semantics"
      >
        Expansion content 1
      </NatExpansion>
      <NatExpansion
        label="Expansion label 2"
        :semantics="semantics"
      >
        Expansion content 2<br>
        Expansion content 2<br>
        Expansion content 2<br>
        Expansion content 2<br>
        Expansion content 2
      </NatExpansion>
      <NatExpansion
        disabled
        label="Expansion label 3 disabled"
        :semantics="semantics"
      >
        Expansion content 2
      </NatExpansion>
    </NatExpansionGroup>
  </div>
</template>
