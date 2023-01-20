<script setup lang="ts">
  import { Dayjs } from 'dayjs'

  type Props = {
    modelValue?: Dayjs
    cursor: Dayjs
    today: Dayjs
    mode: number
    noPastSelect?: boolean
  }
  const props = defineProps<Props>()

  type Emits = {
    (e: 'update:modelValue', day: Props['modelValue']): void
  }
  const emit = defineEmits<Emits>()

  const days = computed<Dayjs[]>(() => {
    if (!props.cursor) return []
    const firstDay = props.cursor.local().startOf('month').startOf('week').startOf('day')
    const daysList: Dayjs[] = new Array(6 * 7)
    for (let i = 0, maxi = daysList.length; i < maxi; i++) {
      daysList[i] = firstDay.add(i, 'days')
    }

    return daysList
  })

  const weekDayNames = computed(() => {
    return days.value.length ? days.value.slice(0, 7).map((item) => item.format('ddd')) : []
  })

  const dayClass = (day: Dayjs): any => {
    return [
      day.isSame(props.today, 'date') ? 'text-white' : 'text-main',
      { 'text-tertiary': !isSelectableDay(day) }
    ]
  }

  const isSelectableDay = (day: Dayjs) => {
    if (props.noPastSelect && day.isBefore(props.today.startOf('day'))) return false

    return props.cursor.isSame(day, 'month')
  }
</script>

<template>
  <div class="grid grid-cols-7 gap-1">
    <div
      v-for="name in weekDayNames"
      :key="name"
      class="w-8 h-8 text-2.5 flex items-center justify-center text-tertiary uppercase"
    >
      {{ name }}
    </div>
    <NatButton
      v-for="(day, dayIndex) in days"
      :key="dayIndex"
      :semantics="day.isSame(today, 'day') ? 'primary' : 'link'"
      :padding="false"
      class="w-8 h-8"
      :active="modelValue && day.isSame(modelValue, 'day')"
      :disabled="!isSelectableDay(day)"
      @click="emit('update:modelValue', day)"
    >
      <div
        class="text-3.5 font-normal"
        :class="dayClass(day)"
      >
        {{ day.date() }}
      </div>
    </NatButton>
  </div>
</template>
