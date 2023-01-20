<script setup lang="ts">
  import { UnwrapNestedRefs } from 'vue'

  import { Pager } from '@/ui/Pagination/Pager'
  import { useScreenBreakpoints } from '@/use/useScreenBreakpoints'

  type ReactivePager = UnwrapNestedRefs<Pager>

  interface Props {
    pager: UnwrapNestedRefs<ReactivePager>
  }

  defineProps<Props>()
  const { t } = useI18n()

  const screen = useScreenBreakpoints()
</script>

<template>
  <NatPagination
    :pager="pager"
    :limit="screen.xl
      ? 10
      : screen.lg
        ? 8
        : screen.xs
          ? 5
          : 3"
  >
    <template #next>
      {{ screen.sm ? t('next') : '' }}
    </template>
    <template #prev>
      {{ screen.sm ? t('prev') : '' }}
    </template>
    <template #default="{ to, from, total }">
      <span v-if="!screen.md" />
      <em
        v-else-if="total != null"
        class="text-tertiary"
      >
        <template v-if="total > 1">
          {{ from }}
          {{ t('to') }} {{ to }}
          {{ t('of') }}
        </template> <slot :total="total" />
      </em>
    </template>
  </NatPagination>
</template>
