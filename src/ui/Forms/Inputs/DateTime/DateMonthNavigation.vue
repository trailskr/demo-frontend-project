<script setup lang="ts">
  import { Dayjs } from 'dayjs'

  type Props = {
    modelValue: Dayjs
  }
  const props = defineProps<Props>()

  type Emits = {
    (e: 'update:modelValue', value: Props['modelValue']): void
  }
  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  const dateLabel = computed(() => {
    if (!props.modelValue) return ''

    return `${props.modelValue.format('MMMM')} ${props.modelValue.year()}`
  })

  const shiftMonth = (months: number) => {
    emit('update:modelValue', props.modelValue.add(months, 'months'))
  }
</script>

<template>
  <div class="flex items-center">
    <NatButton
      :aria-label="t('previous-month')"
      class="h-6 w-6"
      :padding="false"
      semantics="link"
      @click="shiftMonth(-1)"
    >
      <IconIcBaselineKeyboardArrowLeft class="h-4 w-4 text-tertiary" />
    </NatButton>
    <div class="flex-auto text-center text-4 font-semibold">
      {{ dateLabel }}
    </div>
    <NatButton
      :aria-label="t('next-month')"
      class="h-6 w-6"
      :padding="false"
      semantics="link"
      @click="shiftMonth(1)"
    >
      <IconIcBaselineKeyboardArrowRight class="h-4 w-4 text-tertiary" />
    </NatButton>
  </div>
</template>
