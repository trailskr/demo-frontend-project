import { rgb, hex } from 'color-convert'
import { HSL, RGB } from 'color-convert/conversions'

import { isArray } from './typecheck'
import { clamp } from './utils'

export type CssColor = string
export type RGBA = [number, number, number, number]
const rgbaRe = / *rgba? *\( *(\d+) *, *(\d+) *, *(\d+) *(?:, *([.\d]+))? *\) */

export const parseRgba = (colorHexOrRgb: CssColor): RGBA => {
  if (colorHexOrRgb.startsWith('rgb')) {
    const m = colorHexOrRgb.match(rgbaRe)
    if (!m) throw new Error('wrong color format')
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[4] == null ? 1 : parseFloat(m[4])]
  }
  return [...hex.rgb(colorHexOrRgb), 1]
}

export const formatRgba = ([r, g, b, a]: RGBA): CssColor => {
  return a !== 1
    ? `rgba(${r}, ${g}, ${b}, ${a})`
    : `#${rgb.hex([r, g, b])}`
}

export const formatColor = (colorHexOrRgb: CssColor | RGB, alpha: number | CssColor = 1): CssColor => {
  const [r, g, b] = isArray(colorHexOrRgb)
    ? colorHexOrRgb
    : parseRgba(colorHexOrRgb)
  return formatRgba([r, g, b, alpha as number])
}

/**
 * Relative brightness by standard from 0 to 1
 * Web Content Accessibility Guidelines (WCAG) 2.0
 * https://www.w3.org/Translations/WCAG20-ru/#relativeluminancedef
 */
export const luminance = (rgbColor: RGB): number => {
  const srgb = rgbColor.map((c) => c / 255)
  const [R, G, B] = srgb.map((c) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * Relative contrast of luminance values according to the standard from 1 to 21
 * Web Content Accessibility Guidelines (WCAG) 2.0
 * https://www.w3.org/Translations/WCAG20-ru/#contrast-ratiodef
 */
export const contrast = (luminance1: number, luminance2: number): number => {
  const l1 = Math.max(luminance1, luminance2) // the brightest luminance
  const l2 = Math.min(luminance1, luminance2) // the darkest luminance
  return (l1 + 0.05) / (l2 + 0.05)
}

export const getMoreConstrastTextColorForBg = (bgColor: CssColor, darkColor = 'black', lightColor = 'white'): CssColor => {
  const lum = luminance(hex.rgb(bgColor))
  const contrastToWhite = contrast(1, lum)
  const contrastToBlack = contrast(0, lum)
  return contrastToWhite > contrastToBlack ? lightColor : darkColor
}

/** amount from 0-1, where 1 is 100% */
export const lighten = (color: HSL, amount: number): HSL => {
  const [hue, saturation, lightness] = color
  return [
    hue,
    saturation,
    clamp(lightness + amount * 255, 0, 1)
  ]
}

/** amount from 0-1, where 1 is 100% */
export const darken = (color: HSL, amount: number): HSL => {
  const [hue, saturation, lightness] = color
  return [
    hue,
    saturation,
    clamp(lightness - amount * 255, 0, 255)
  ]
}

/** amount from 0-1, where 1 is 100% */
export const saturate = (color: HSL, amount: number): HSL => {
  const [hue, saturation, lightness] = color
  return [
    hue,
    clamp(saturation + saturation * amount, 0, 255),
    lightness
  ]
}

/** amount from 0-1, where 1 is 100% */
export const desaturate = (color: HSL, amount: number): HSL => {
  const [hue, saturation, lightness] = color
  return [
    hue,
    clamp(saturation - saturation * amount, 0, 255),
    lightness
  ]
}
