<script setup lang="ts">
  // Original: https://vuejsexamples.com/vue-color-picker/

  import { hsv, hex, rgb } from 'color-convert'

  interface Props {
    modelValue?: string | null
    allowOpacityChange?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', v: string | undefined): void
  }

  const emit = defineEmits<Emits>()

  const rgbaRe = / *rgba? *\( *(\d+) *, *(\d+) *, *(\d+) *(?:, *([.\d]+))? *\) */

  const hslString = (h: number, s: number, l: number): string => {
    return `hsl(${h}, ${s}%, ${l}%)`
  }

  const hslaString = (h: number, s: number, l: number, a: number): string => {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`
  }

  const c = reactive({
    h: 0,
    s: 80,
    v: 100,
    a: 100
  })

  const color = computed(() => {
    const [h, s, l] = hsv.hsl([c.h, c.s, c.v])
    return hslaString(h, s, l, c.a / 100)
  })

  const bgImageH = computed(() => {
    const stops = []
    for (let i = 0; i < 13; i++) {
      const h = i * 30
      const [, s, l] = hsv.hsl([h, 100, 100])
      stops.push(hslString(h, s, l))
    }
    return `linear-gradient(to right, ${stops.join(', ')})`
  })

  const bgImageS = computed(() => {
    const stops = []
    for (let i = 0; i < 2; i += 1) {
      const [h, s, l] = hsv.hsl([c.h, i * 100, 100])
      stops.push(hslString(h, s, l))
    }
    return `linear-gradient(to right, ${stops.join(', ')})`
  })

  const bgImageV = computed(() => {
    const stops = []
    for (let i = 0; i < 2; i++) {
      const [h, s, l] = hsv.hsl([c.h, 100, i * 100])
      stops.push(hslString(h, s, l))
    }
    return `linear-gradient(to right, ${stops.join(', ')})`
  })

  const bgImageA = computed(() => {
    const stops = []
    for (let i = 0; i < 2; i++) {
      const [h, s, l] = hsv.hsl([c.h, c.s, c.v])
      stops.push(hslaString(h, s, l, i))
    }
    return `linear-gradient(to right, ${stops.join(', ')})`
  })

  let internalChange = false

  const onValue = (val?: string | null) => {
    if (!val) return
    if (val[0] === '#') {
      const [h, s, v] = hex.hsv(val.slice(1))
      c.h = h
      c.s = s
      c.v = v
      c.a = 100
    } else if (val.startsWith('rgb')) {
      const m = val.match(rgbaRe)
      if (m) {
        const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
        const [h, s, v] = rgb.hsv(r, g, b)
        c.h = h
        c.s = s
        c.v = v
        c.a = props.allowOpacityChange
          ? m[4] ? Math.round(parseFloat(m[4]) * 100) : 100
          : 100
      }
    }
  }

  watch(() => props.modelValue, (val) => {
    if (internalChange) {
      internalChange = false
    } else {
      onValue(val)
    }
  }, { immediate: true })

  const onInput = () => {
    internalChange = true
    if (c.a === 100) {
      emit('update:modelValue', `#${hsv.hex([c.h, c.s, c.v])}`)
    } else {
      const [r, g, b] = hsv.rgb([c.h, c.s, c.v])
      emit('update:modelValue', `rgba(${r}, ${g}, ${b}, ${c.a / 100})`)
    }
  }

  const onValueInput = (val?: string | null) => {
    onValue(val)
    onInput()
  }
</script>

<template>
  <div>
    <div
      class="h-25 rounded-5px"
      style="background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==')"
    >
      <div
        class="h-full rounded-5px"
        :style="{ background: color }"
      />
    </div>
    <div class="inner mb-2">
      <NatRange
        v-model="c.h"
        :min="0"
        :max="360"
        :trackStyle="{ background: bgImageH }"
        @update:modelValue="onInput()"
      />
      <NatRange
        v-model="c.s"
        :min="0"
        :max="100"
        :trackStyle="{ background: bgImageS }"
        @update:modelValue="onInput()"
      />
      <NatRange
        v-model="c.v"
        :min="0"
        :max="100"
        :trackStyle="{ background: bgImageV }"
        @update:modelValue="onInput()"
      />
      <NatRange
        v-if="allowOpacityChange"
        v-model="c.a"
        :min="0"
        :max="100"
        trackBgStyle="background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==')"
        :trackStyle="{ background: bgImageA }"
        @update:modelValue="onInput()"
      />
      <NatText
        class="color-input form-control"
        :modelValue="modelValue"
        @update:modelValue="onValueInput"
      />
    </div>
    <slot />
  </div>
</template>
