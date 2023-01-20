<script setup lang="ts">
  import { MaybeElement } from '@vueuse/core'
  import dayjs, { Dayjs } from 'dayjs'
  // @ts-ignore-next-line
  // noinspection TypeScriptCheckImport
  import { IMaskComponent } from 'vue-imask'

  import {
    timeParse, dateParse, dateTimeParse,
    timeFormat, dateFormat, dateTimeFormat,
    timeSerialize, dateSerialize, dateTimeSerialize,
    timeDeserialize, dateDeserialize, dateTimeDeserialize,
    dateLocalFormat, timeLocalFormat, dateTimeLocalFormat
  } from '@/utils/date'

  import Time from './Time.vue'
  import { dateBlocks } from './constants'
  import { NatInputDateTimeExpose } from './dateTime'

  interface Props {
    modelValue?: string | null
    time?: boolean
    date?: boolean
    disabled?: boolean
    hideControls?: boolean
    referenceRef?: MaybeElement
    noPastSelect?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', v?: string | null): void
  }

  const emit = defineEmits<Emits>()

  const root = ref<HTMLElement>()
  const computedReferenceRef = computed(() => props.referenceRef ?? root.value)
  const inputRef = ref<InstanceType<typeof IMaskComponent>>()
  const timeRef = ref<InstanceType<typeof Time>>()
  const calendarContainerRef = ref<HTMLDivElement>()

  const mode = computed(() => Number(props.date ?? false) * 2 + Number(props.time ?? false) - 1)
  const parser = computed(() => [timeParse, dateParse, dateTimeParse][mode.value])
  const formatter = computed(() => [timeFormat, dateFormat, dateTimeFormat][mode.value])
  const serializer = computed(() => [timeSerialize, dateSerialize, dateTimeSerialize][mode.value])
  const deserializer = computed(() => [timeDeserialize, dateDeserialize, dateTimeDeserialize][mode.value])

  const d = ref<Dayjs>()
  const dateToSave = ref<Dayjs>()
  const cursor = ref<Dayjs>(d.value && d.value.isValid() ? d.value.local() : dayjs())
  const today = ref<Dayjs>(dayjs())
  const enteredString = ref('')
  const displayValue = ref('')

  let externalChange = false
  let internalChange = false

  watch(d, (dVal) => {
    internalChange = true
    if (!externalChange) {
      const value = dVal && dVal.isValid() ? serializer.value(dVal) : undefined
      emit('update:modelValue', value)
    }
    if (dVal && dVal.isValid()) {
      displayValue.value = formatter.value(dVal) ?? ''
      cursor.value = dVal.local()
    } else {
      if (dVal == null) {
        displayValue.value = ''
      }
      cursor.value = cursor.value || dayjs()
    }
    nextTick(() => {
      internalChange = false
    })
  }, { flush: 'sync' })

  watch(() => props.modelValue, (modelValue) => {
    if (internalChange) return
    externalChange = true
    d.value = deserializer.value(modelValue)
    nextTick(() => {
      externalChange = false
    })
  }, { immediate: true, flush: 'sync' })

  const pattern = computed(() => [timeLocalFormat, dateLocalFormat, dateTimeLocalFormat][mode.value])
  const placeholder = computed(() => pattern.value?.toLowerCase() ?? '')

  const parseDisplay = (v: string) => {
    if (!v) {
      d.value = undefined
    } else {
      enteredString.value = v
      const dVal = parser.value(v)
      d.value = dVal || dayjs(null)
    }
  }

  const setDayToSave = (day: Dayjs) => {
    if (dateToSave.value) {
      day = day
        .hour(dateToSave.value.local().hour())
        .minute(dateToSave.value.local().minute())
    }

    dateToSave.value = day
  }

  const saveDate = () => {
    if (!dateToSave.value) return

    const conf = { year: dateToSave.value.year(), month: dateToSave.value.month(), date: dateToSave.value.date() }
    if (mode.value === 1) {
      // date mode assume dateToSave.value is in UTC at all stages
      if (dateToSave.value && dateToSave.value.isValid()) {
        d.value = dayjs().set(conf).startOf('day')
      } else {
        d.value = dayjs.utc().set(conf)
      }
    } else {
      if (dateToSave.value && dateToSave.value.isValid()) {
        d.value = dateToSave.value.local().set(conf).utc()
      } else {
        d.value = dayjs().set(conf).utc()
      }
    }

    closeDropdown()
  }

  const clearDate = () => {
    dateToSave.value = undefined
    if (timeRef.value) timeRef.value.resetTime()
    emit('update:modelValue', '')
  }

  const onBlur = () => {
    if (d.value) {
      if (d.value.isValid()) {
        displayValue.value = formatter.value(d.value) ?? ''
      } else {
        d.value = undefined
        displayValue.value = ''
      }
    } else {
      displayValue.value = ''
    }
  }

  const isDropdownOpen = ref(false)
  const toggleDropdown = () => {
    inputRef.value.$el.focus()
    isDropdownOpen.value = !isDropdownOpen.value
  }

  const openDropdown = () => {
    isDropdownOpen.value = true
  }

  const closeDropdown = () => {
    isDropdownOpen.value = false
  }

  const focus = () => {
    inputRef.value.$el.focus()
    openDropdown()
  }

  watch(isDropdownOpen, (open) => {
    if (open) {
      setTimeout(() => {
        calendarContainerRef.value?.scrollIntoView({ behavior: 'smooth' })
      }, 10)
    }
    if (!open) dateToSave.value = undefined
    if (open && d.value) dateToSave.value = d.value
  })

  const toExpose: NatInputDateTimeExpose = { openDropdown, toggleDropdown, focus }
  defineExpose(toExpose)
</script>

<template>
  <label
    ref="root"
    class="flex items-stretch flex-auto relative space-x-1"
  >
    <IMaskComponent
      ref="inputRef"
      v-model="displayValue"
      :value="displayValue"
      class="w-full flex-auto"
      :size="14"
      :placeholder="placeholder"
      inputmode="none"

      :mask="pattern"
      :blocks="dateBlocks"
      :unmask="false"
      :disabled="disabled"
      eager
      autofix
      @blur="onBlur"
      @accept="parseDisplay"
    />
    <DateTimeControls
      v-if="!hideControls"
      :date="date"
      @click="toggleDropdown"
    />
    <NatDropdown
      ref="dropdown"
      v-model="isDropdownOpen"
      placement="bottom-end"
      :disabled="disabled"
      :referenceRef="computedReferenceRef"
    >
      <div
        ref="calendarContainerRef"
        class="select-none p-4"
      >
        <div class="flex flex-col-reverse lg:flex-col">
          <div
            v-if="date"
            class="bg-substrate p-2.5 mb-4"
          >
            <DateMonthNavigation v-model="cursor" />
            <Calendar
              :modelValue="dateToSave"
              :mode="mode"
              :cursor="cursor"
              :today="today"
              :noPastSelect="noPastSelect"
              @update:modelValue="setDayToSave($event as Dayjs)"
            />
          </div>
          <Time
            v-if="time"
            ref="timeRef"
            v-model="dateToSave"
            class="mb-4"
            :enteredString="enteredString"
            :mode="mode"
          />
        </div>
        <DateTimeActions
          @clear="clearDate"
          @cancel="closeDropdown"
          @save="saveDate"
        />
      </div>
    </NatDropdown>
  </label>
</template>
