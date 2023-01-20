<script setup lang="ts">
  import dayjs, { Dayjs } from 'dayjs'
  // @ts-ignore-next-line
  // noinspection TypeScriptCheckImport
  import { IMaskComponent } from 'vue-imask'

  import { dateBlocks, defaultTime } from './constants'

  type MiddayType = 'AM' | 'PM'

  type Props = {
    modelValue?: Dayjs
    enteredString?: string
    mode: number
  }
  const props = defineProps<Props>()

  type Emits = {
    (e: 'update:modelValue', value: Props['modelValue']): void
  }
  const emit = defineEmits<Emits>()

  const time = ref(defaultTime)
  const resetTime = () => {
    time.value = defaultTime
    selectedMidday.value = 'AM'
  }

  const midDays: MiddayType[] = ['AM', 'PM']
  const selectedMidday = ref<MiddayType>('AM')
  /**
   * AM|PM switch handler, increment or decrement hours based on midday switch direction
   */
  const setMidday = (value: MiddayType) => {
    if (!props.modelValue || value === selectedMidday.value) return

    const isIncrementHours = value === 'PM' && selectedMidday.value === 'AM'
    const resultValue = props.modelValue.add(isIncrementHours ? 12 : -12, 'hour')
    emit('update:modelValue', resultValue)
    selectedMidday.value = value
  }

  const isValidTime = computed(() => /^[0-1][0-9]:[0-5][0-9]$/.test(time.value))

  const onBlur = () => {
    if (!isValidTime.value) time.value = defaultTime
  }

  /**
   * Set hours and minutes to date if valid time
   */
  const setTime = () => {
    nextTick(() => {
      if (!isValidTime.value) return

      let [hour, minute] = time.value.split(':')
      hour = hour === '12' ? '0' : hour
      const resultValue = (props.modelValue || dayjs())
        .local()
        .hour(+normalizeHourTo24Format(hour))
        .minute(+minute)
        .utc()

      emit('update:modelValue', resultValue)
    })
  }

  /**
   * Convert AM|PM format hour value to 24h format value
   */
  const normalizeHourTo24Format = (hour: string) => {
    const hourNormalizer: Record<MiddayType, (hour: string) => string> = {
      AM: (h) => h === '12' ? '0' : h,
      PM: (h) => h === '12' ? h : String(+h + 12)
    }

    return hourNormalizer[selectedMidday.value](hour)
  }

  onMounted(() => {
    if (props.modelValue) {
      const [timeValue, middayValue] = props.modelValue.local().format('hh:mm A').split(' ')

      time.value = timeValue
      selectedMidday.value = middayValue as MiddayType
    }
  })

  defineExpose({ resetTime })
</script>

<template>
  <div
    class="flex justify-between"
  >
    <NatField
      v-model="time"
      :padding="{ y: 'py-1' }"
    >
      <IMaskComponent
        v-model="time"
        :value="time"
        :size="4"
        class="w-15"
        placeholder="hh:mm"
        mask="hh:mm"
        :blocks="dateBlocks"
        :unmask="true"
        autocomplete="off"
        autofix
        @blur="onBlur"
        @accept="setTime"
      />
    </NatField>

    <NatButtonGroup
      class="ml-8"
      semantics="link"
    >
      <NatButton
        v-for="val in midDays"
        :key="val"
        semantics="link"
        class="px-3 py-2 text-3"
        :padding="false"
        :label="val"
        :active="val === selectedMidday"
        @click="setMidday(val)"
      />
    </NatButtonGroup>
  </div>
</template>
