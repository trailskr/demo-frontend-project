<script setup lang="ts">
  const { t } = useI18n()
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center gap-4 bg-primary text-white pa-8">
    <div style="font-size: 30vh">
      404
    </div>

    <div
      class="text-opacity-40"
    >
      {{ t('page-does-not-exist') }}
    </div>

    <RouterLink
      v-slot="{ navigate, href }"
      :to="{ name: 'Home' }"
    >
      <NatButton
        type="link"
        :href="href"
        class="mt-8"
        semantics="accent"
        :label="t('go-home')"
        @click.prevent="navigate()"
      />
    </RouterLink>
  </div>
</template>
