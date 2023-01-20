<script setup lang="ts">
  import { UnwrapNestedRefs } from 'vue'

  import { Pager } from './Pager'

  type ReactivePager = UnwrapNestedRefs<Pager>

  const perPageOptions = [
    { text: '5', value: 5 },
    { text: '10', value: 10 },
    { text: '20', value: 20 },
    { text: '50', value: 50 },
    { text: '100', value: 100 },
    { text: '500', value: 500 }
  ]

  interface Props {
    pager: UnwrapNestedRefs<ReactivePager>
    limit?: number
    limitSelect?: boolean
    prevText?: string
    nextText?: string
    isLoading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    limit: 10,
    limitSelect: false
  })

  interface Emits {
    (e: 'change', pager: UnwrapNestedRefs<ReactivePager>): void
  }

  const emit = defineEmits<Emits>()

  const leftPage = ref(1)

  interface PageViewFrom {from: number}
  interface PageViewTo {to: number}
  type PageView = PageViewFrom | PageViewTo
  type PageValue = number | PageView

  const isPageViewFrom = (view: PageView): view is PageViewFrom => 'from' in view

  interface Pages {
    values: PageValue[]
    from: number
    to: number
  }

  const pages = computed((): Pages => {
    const len = Math.min(props.pager.lastPage, props.limit)
    const pageNumbers = new Array<number>(len)
    for (let i = 0; i < len; i++) {
      pageNumbers[i] = leftPage.value + i
    }

    let from = pageNumbers[0] as number
    let to = pageNumbers[len - 1] as number

    const values: PageValue[] = Array.from(pageNumbers)

    const last = props.pager.lastPage
    if (showBounds.value) {
      if (pageNumbers[0] !== 1) {
        values[0] = 1
        from += 1
      }
      if (pageNumbers[len - 1] !== last) {
        values[len - 1] = last
        to -= 1
      }
      if (pageNumbers[1] !== 2) {
        values[1] = { to: pageNumbers[1] }
        from += 1
      }
      if (pageNumbers[len - 2] !== last - 1) {
        values[len - 2] = { from: pageNumbers[len - 2] }
        to -= 1
      }
    }
    return { values, from, to }
  })

  const showBounds = computed<boolean>(() => {
    return Math.min(props.pager.lastPage, props.limit) >= 6
  })

  const boundsCheck = () => {
    const limit = props.limit - 1
    if (leftPage.value + limit > props.pager.lastPage) {
      leftPage.value = props.pager.lastPage - limit
    }
    if (leftPage.value < 1) {
      leftPage.value = 1
    }
  }

  const setView = (view: PageView) => {
    if (isPageViewFrom(view)) {
      leftPage.value = view.from - Number(showBounds.value) * 2
    } else {
      leftPage.value = view.to - props.limit + 1 + Number(showBounds.value) * 2
    }
    boundsCheck()
  }

  const changePage = (page: PageValue) => {
    if (typeof page === 'number') {
      if (props.pager.page !== page) {
        props.pager.update({ page })
        emit('change', props.pager)
      }
    } else {
      setView(page)
    }
  }

  const limitChanged = (limit: string) => {
    props.pager.update({ limit: +limit })
    emit('change', props.pager)
  }

  watch(() => props.pager.page, (page: PageValue) => {
    if (typeof page !== 'number' || !isFinite(page)) return
    page = Math.max(Math.min(page, props.pager.lastPage), 1)
    if (page < pages.value.from) {
      setView({ to: page })
    } else if (page > pages.value.to) {
      setView({ from: page })
    }
  })
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="flex-auto">
      <slot
        :from="pager.offset + 1"
        :to="Math.min(pager.offset + pager.limit, pager.total ?? Infinity)"
        :total="pager.total"
      >
        <em
          v-if="pager.total != null"
          class="text-tertiary"
        >
          <template v-if="pager.total > 1">
            {{ pager.offset + 1 }}
            <slot name="to">-</slot> {{ Math.min(pager.offset + pager.limit, pager.total ?? Infinity) }}
            <slot name="of" />
          </template>
          <slot
            name="total"
            :total="pager.total"
          >/ {{ pager.total }}</slot>
        </em>
      </slot>
      <NatSpinner
        v-if="isLoading"
        width="30px"
      />
    </div>
    <div
      class="flex items-center gap-1 sm:gap-6"
      style="margin: 0; padding: 0"
    >
      <template v-if="pager.limit !== 0">
        <NatButton
          class="h-11.5 px-3.25 min-w-11.5"
          :padding="false"
          :disabled="pager.page === 1"
          semantics="primary"
          @click="pager.page !== 1 && changePage(pager.page - 1)"
        >
          <IconIcBaselineKeyboardArrowLeft /> <span v-if="$slots.prev"><slot name="prev" /></span>
        </NatButton>

        <div class="flex items-center">
          <NatButton
            v-for="(page, index) in pages.values"
            :key="index"
            class="w-11.5 h-11.5"
            :padding="false"
            semantics="link"
            :active="pager.page === page"
            @click="changePage(page)"
          >
            <span :class="pager.page === page ? 'text-primary' : 'text-main'">{{ typeof page === 'number' ? page : '…' }}</span>
          </NatButton>
        </div>

        <NatButton
          class="h-11.5 px-3.25 min-w-11.5"
          :padding="false"
          semantics="primary"
          :disabled="pager.page === pager.lastPage"
          @click="pager.page !== pager.lastPage && changePage(pager.page + 1)"
        >
          <span v-if="$slots.next"><slot name="next" /> </span><IconIcBaselineKeyboardArrowRight />
        </NatButton>
      </template>
      <select
        v-if="limitSelect"
        :value="pager.limit"
        @change="limitChanged(($event?.target as HTMLSelectElement)?.value)"
      >
        <option
          v-for="o in perPageOptions"
          :key="o.value"
          :value="o.value"
        >
          {{ o.text }}
        </option>
      </select>
    </div>
  </div>
</template>
