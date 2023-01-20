<script setup lang="ts">
  import { RouteLocationRaw } from 'vue-router'

  interface Props {
    backRoute?: RouteLocationRaw
  }

  defineProps<Props>()
</script>

<template>
  <main class="px-6 lg:px-10 flex flex-col">
    <div
      v-if="$slots.header"
      class="relative py-30px"
    >
      <div
        v-if="backRoute"
        class="absolute top-2 left-0"
      >
        <RouterLink
          v-slot="{ navigate, href }"
          custom
          :to="backRoute"
        >
          <NatButton
            type="link"
            :href="href"
            class="px-2 py-1"
            :padding="false"
            semantics="link"
            @click.prevent="navigate"
          >
            <span class="text-3">&lt; Back</span>
          </NatButton>
        </RouterLink>
      </div>
      <slot name="header" />
    </div>
    <slot />
  </main>
</template>
