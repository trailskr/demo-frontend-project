import { DeepReadonly } from 'vue'

import { screenBreakpoints } from '@/screenBreakpoints'

export type ScreenBreakpoints = Record<keyof typeof screenBreakpoints, boolean>

const { width } = useWindowSize()

const breakpoints = reactive(Object.entries(screenBreakpoints).reduce((res, [name, size]) => {
  return { ...res, [name]: width.value >= size }
}, {} as ScreenBreakpoints))

watch(width, (w) => {
  Object.entries(screenBreakpoints).forEach(([name, size]) => {
    breakpoints[name as keyof ScreenBreakpoints] = w >= size
  })
})

const readonlyBreakpoints = readonly(breakpoints)

export const useScreenBreakpoints = (): DeepReadonly<ScreenBreakpoints> => {
  return readonlyBreakpoints
}
