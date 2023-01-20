
let span: HTMLSpanElement

export interface TextMesurement {
    width: number
    height: number
}

export interface TextMesurementOptions {
  font?: string
  letterSpacing?: string
}

const createSpan = (): HTMLSpanElement => {
  const el = document.createElement('span')
  el.style.top = '0'
  el.style.left = '0'
  el.style.visibility = 'hidden'
  el.style.overflow = 'hidden'
  el.style.position = 'absolute'
  el.style.zIndex = '-1000'
  document.body.appendChild(el)

  return el
}

const doMeasureText = (text: string, { font, letterSpacing }: TextMesurementOptions): TextMesurement => {
  span.style.font = font ?? ''
  span.style.letterSpacing = letterSpacing ?? ''
  span.innerText = text
  const box = span.getBoundingClientRect()

  return {
    width: box.width,
    height: box.height
  }
}

export const measureText = (text: string, options: TextMesurementOptions = {}): Promise<TextMesurement> => {
  span = span || createSpan()
  // Force browser to load font if not used before
  span.style.font = options.font ?? ''

  if (!document.fonts) {
    // Can be not accurate mesurement in old browsers, where document.fonts is not supported
    return Promise.resolve(doMeasureText(text, options))
  }

  return document.fonts.ready.then(() => {
    return doMeasureText(text, options)
  })
}

export const measureTextSync = (text: string, options: TextMesurementOptions = {}): TextMesurement => {
  span = span || createSpan()
  return doMeasureText(text, options)
}
