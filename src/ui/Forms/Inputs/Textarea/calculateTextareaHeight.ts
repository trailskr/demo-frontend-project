/*
The MIT License (MIT)

Copyright (c) 2013 Andrey Popp

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Modifications copyright 2019 1C.

Original: https://github.com/andreypopp/react-textarea-autosize
*/

import { isNumber } from '@/utils/typecheck'

const HIDDEN_TEXTAREA_STYLE = {
  'min-height': '0',
  'max-height': 'none',
  height: '0',
  visibility: 'hidden',
  overflow: 'hidden',
  position: 'absolute',
  'z-index': '-1000',
  top: '0',
  right: '0'
}

const BORDER_BOX = 'border-box'
const CONTENT_BOX = 'content-box'

const hiddenTextarea = document.createElement('textarea')

const forceHiddenStyles = (node: HTMLTextAreaElement) => {
  (Object.keys(HIDDEN_TEXTAREA_STYLE) as (keyof typeof HIDDEN_TEXTAREA_STYLE)[]).forEach(
    (key) => {
      node.style.setProperty(key, HIDDEN_TEXTAREA_STYLE[key], 'important')
    }
  )
}

forceHiddenStyles(hiddenTextarea)

const LETTER_SPACING = 'letter-spacing'
const LINE_HEIGHT = 'line-height'
const FONT_FAMILY = 'font-family'
const FONT_WEIGHT = 'font-weight'
const FONT_SIZE = 'font-size'
const FONT_STYLE = 'font-style'
const TAB_SIZE = 'tab-size'
const TEXT_RENDERING = 'text-rendering'
const TEXT_TRANSFORM = 'text-transform'
const WIDTH = 'width'
const TEXT_INDENT = 'text-indent'

const PADDING_TOP = 'padding-top'
const PADDING_RIGHT = 'padding-right'
const PADDING_BOTTOM = 'padding-bottom'
const PADDING_LEFT = 'padding-left'

const BORDER_TOP_WIDTH = 'border-bottom-width'
const BORDER_RIGHT_WIDTH = 'border-right-width'
const BORDER_BOTTOM_WIDTH = 'border-bottom-width'
const BORDER_LEFT_WIDTH = 'border-left-width'

const BOX_SIZING = 'box-sizing'

const SIZING_STYLES = [
  LETTER_SPACING,
  LINE_HEIGHT,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  FONT_STYLE,
  TAB_SIZE,
  TEXT_RENDERING,
  TEXT_TRANSFORM,
  WIDTH,
  TEXT_INDENT,
  PADDING_TOP,
  PADDING_RIGHT,
  PADDING_BOTTOM,
  PADDING_LEFT,
  BORDER_TOP_WIDTH,
  BORDER_RIGHT_WIDTH,
  BORDER_BOTTOM_WIDTH,
  BORDER_LEFT_WIDTH,
  BOX_SIZING
]

interface SizeStyling {
    [LETTER_SPACING]?: string
    [LINE_HEIGHT]?: string
    [FONT_FAMILY]?: string
    [FONT_WEIGHT]?: string
    [FONT_SIZE]?: string
    [FONT_STYLE]?: string
    [TAB_SIZE]?: string
    [TEXT_RENDERING]?: string
    [TEXT_TRANSFORM]?: string
    [WIDTH]?: string
    [TEXT_INDENT]?: string
    [PADDING_TOP]?: string
    [PADDING_RIGHT]?: string
    [PADDING_BOTTOM]?: string
    [PADDING_LEFT]?: string
    [BORDER_TOP_WIDTH]?: string
    [BORDER_RIGHT_WIDTH]?: string
    [BORDER_BOTTOM_WIDTH]?: string
    [BORDER_LEFT_WIDTH]?: string
    [BOX_SIZING]?: string
}

interface TextareaStyling {
    paddingSize: number
    borderSize: number
    boxSizing: string
    sizingStyle: SizeStyling
}

const calculateNodeStyling = (node: HTMLTextAreaElement): TextareaStyling | undefined => {
  const style = window.getComputedStyle(node)
  if (style === null) return undefined

  const sizingStyle: SizeStyling = SIZING_STYLES.reduce((obj, styleName) => {
    obj[styleName] = style.getPropertyValue(styleName)
    return obj
  }, {} as Record<string, unknown>)

  const boxSizing = style.getPropertyValue(BOX_SIZING)

  // probably node is detached from DOM, can't read computed dimensions
  if (boxSizing === '') {
    return undefined
  }

  const paddingSize: number = parsePx(sizingStyle[PADDING_BOTTOM]) + parsePx(sizingStyle[PADDING_TOP])

  const borderSize: number = parsePx(sizingStyle[BORDER_BOTTOM_WIDTH]) + parsePx(sizingStyle[BORDER_TOP_WIDTH])

  return {
    sizingStyle,
    paddingSize,
    borderSize,
    boxSizing
  }
}

/** Parses the size values in pixels */
export const parsePx = (value: number | string | undefined): number => {
  if (!value) return 0
  if (isNumber(value)) return value
  const m = value.match(/([\d.]*)px\s*/)
  return m ? parseFloat(m[1]) : 0
}

/** Results of measurements of the heights of the textarea element */
export interface TextAreaHeightCalculation {
    height: number
    minHeight: number
    maxHeight: number
}

/** Calculating the height and capacity parameters of textarea */
export const calculateTextAreaHeight = (
  uiTextNode: HTMLTextAreaElement,
  minHeightInRows?: number,
  maxHeightInRows?: number
): TextAreaHeightCalculation | undefined => {
  if (hiddenTextarea.parentNode === null) {
    document.body.appendChild(hiddenTextarea)
  }

  // Copy all CSS properties that have an impact on the height of the content in the textbox
  const nodeStyling = calculateNodeStyling(uiTextNode)

  if (nodeStyling === undefined) return undefined

  const { paddingSize, borderSize, boxSizing, sizingStyle }: TextareaStyling = nodeStyling;

  // Need to have the overflow attribute to hide the scrollbar otherwise
  // text-lines will not calculated properly as the shadow will technically be
  // narrower for content
  (Object.keys(sizingStyle) as (keyof SizeStyling)[]).forEach((key) => {
    ((hiddenTextarea.style as unknown) as Record<string, unknown>)[key] = sizingStyle[key]
  })
  forceHiddenStyles(hiddenTextarea)
  hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || 'x'

  let minHeight = -Infinity
  let maxHeight = Infinity
  let height = hiddenTextarea.scrollHeight

  if (boxSizing === BORDER_BOX) {
    // border-box: add border, since height = content + padding + border
    height = height + borderSize
  } else if (boxSizing === CONTENT_BOX) {
    // remove padding, since height = content
    height = height - paddingSize
  }

  // measure height of a textarea with a single row
  hiddenTextarea.value = 'x'
  const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize

  // Stores the value's rows count rendered in `hiddenTextarea`,
  // regardless if `maxHeightInRows` or `minHeightInRows` props are passed
  // const valueRowCount = Math.floor(height / singleRowHeight);
  if (minHeightInRows !== undefined) {
    minHeight = singleRowHeight * minHeightInRows
    if (boxSizing === BORDER_BOX) {
      minHeight = minHeight + paddingSize + borderSize
    }
    height = Math.max(minHeight, height)
  }

  if (maxHeightInRows !== undefined) {
    maxHeight = singleRowHeight * maxHeightInRows
    if (boxSizing === BORDER_BOX) {
      maxHeight = maxHeight + paddingSize + borderSize
    }
    height = Math.min(maxHeight, height)
  }

  return { height, minHeight, maxHeight }
}
