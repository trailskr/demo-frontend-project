import {
  defineConfig,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

import { screenBreakpoints } from './src/screenBreakpoints'
import { themeColors } from './src/themeColors'
import { parentNamedGroupStatusModifier } from './unocss-named-group-status'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  include: /\.(vue|html|ts)$/,
  theme: {
    colors: themeColors,
    boxShadow: {
      btn: '6px 6px 16px rgba(0, 103, 160, 0.2)',
      inbtn: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',
      popover: '0px 4px 11px rgba(0, 0, 0, 0.1)',
      footer: '0px -6px 14px rgba(36, 76, 90, 0.1)',
      key: '1px 1px 1px 0 rgba(255, 255, 255, .6)',
      inset2: 'inset 0 0 0 2px rgba(255, 255, 255, 1)'
    },
    screens: Object.entries(screenBreakpoints).reduce((res, [name, size]) => ({ ...res, [name]: { min: `${size}px` } }), {})
  },
  variants: [
    parentNamedGroupStatusModifier
  ],
  shortcuts: {
    'text-theme': 'text-main dark:text-background',
    'bg-theme': 'bg-background dark:bg-main'
  },
  presets: [
    presetUno(),
    presetTypography({
      cssExtend: {
        p: {
          margin: '0.5em 0',
          'line-height': 1.5
        },
        ul: {
          margin: '0.5em 0',
          'line-height': 1.5
        },
        ol: {
          margin: '0.5em 0',
          'line-height': 1.5
        },
        h1: {
          margin: '0.5em 0',
          'font-size': '1.75em'
        },
        h2: {
          margin: '0.5em 0',
          'font-size': '1.5em'
        },
        h3: {
          margin: '0.5em 0',
          'font-size': '1.25em'
        },
        a: {
          color: '#0067A0'
        }
      }
    }),
    presetWebFonts({
      fonts: {
        sans: 'Outfit',
        handwriting: 'Square Peg'
      }
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' ')
})
