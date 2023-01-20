<script setup lang="ts">
  import { browser } from '@/utils/browser'

  interface Props {
    pc: string[]
    mac: string[]
    plusClass?: string
    keyClass?: string
  }

  const props = defineProps<Props>()

  const numKeysAliases: Record<string, string> = {
    Add: '+',
    Multiply: '*',
    Subtract: '-',
    Decimal: '.',
    Equal: '=',
    Comma: ',',
    Divide: '/'
  }

  const mapNumKeys = (key: string) => {
    return numKeysAliases[key] ?? key
  }

  const keysAliases: Record<string, string> = {
    Minus: '-',
    Equal: '='
  }

  const mapKeys = (key: string) => {
    return keysAliases[key] ?? key
  }

  const keys = computed(() => {
    const isMac = browser?.os === 'Mac OS'
    const ks = isMac ? props.mac : props.pc
    return ks.map((key) => {
      return key.startsWith('Numpad')
        ? `Numpad ${mapNumKeys(key.slice(6))}`
        : isMac
          ? key === 'Alt' ? 'Option' : key
          : mapKeys(key)
    })
  })
</script>

<template>
  <div class="inline-flex items-center gap-1 font-semibold text-main text-3.25">
    <template
      v-for="(key, index) in keys"
      :key="index"
    >
      <div
        v-if="index !== 0 && keys.length > 1"
        :class="plusClass"
      >
        +
      </div>
      <div
        class="px-2 py-0.5 bg-substrate border-tertiary border-1 rounded-5px shadow-key"
        :class="keyClass"
      >
        {{ key }}
      </div>
    </template>
  </div>
</template>
