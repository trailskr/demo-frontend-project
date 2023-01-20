import { isArray, isDate, isFunction, isNumber, isObjectLike, isString } from './typecheck'

export const noop = () => {}
export const identity = <T>(arg: T): T => arg

export const objectEntries = <T extends Record<string, unknown>> (obj: T): { [Key in keyof T]: [Key, T[Key]] }[keyof T][] => {
  return Object.entries(obj) as { [Key in keyof T]: [Key, T[Key]] }[keyof T][]
}

export const objectKeys = <T extends Record<string, unknown>>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[]
}

export const objectValues = <T extends Record<string, unknown>>(obj: T): { [Key in keyof T]: T[Key] }[keyof T][] => {
  return Object.values(obj) as { [Key in keyof T]: T[Key] }[keyof T][]
}

export const removeElementFromArray = <T>(arr: T[], element: T): number => {
  const index = arr.indexOf(element)
  if (index !== -1) arr.splice(index, 1)
  return index
}

type FindIndexPredicate<T> = (value: T, index: number, obj: T[]) => unknown
export const removeFromArray = <T>(arr: T[], predicate: FindIndexPredicate<T>): number => {
  const index = arr.findIndex(predicate)
  if (index !== -1) arr.splice(index, 1)
  return index
}

type Structure = {
  [key: string]: Structure | true
}

export const escapeRegExp = (str: string) => {
  return str.replace(/[-[\]{}()*+?.\\^$|]/g, '\\$&')
}

let lastQuery: string | undefined
let lastQueryRe: RegExp | undefined

const getMomoizedQueryRe = (query: string, queryLower: string): RegExp | undefined => {
  if (lastQuery === query) {
    return lastQueryRe
  } else {
    const queryRe = new RegExp(queryLower.split('')
      .map((s) => escapeRegExp(s)).join('.?')
      .replace(/\s/g, '.* .*?'))
    lastQuery = query
    lastQueryRe = queryRe
    return queryRe
  }
}

/**
 * Full-text string search
 * @param str - search string
 * @param query - search string
 * @* @param [not Exact Search] - whether to use an inaccurate search
 * @returns number - the priority index is returned, the smaller the number, the greater the priority
 * The search priority is as follows:
 * - full match of the found string (1)
 * - full match case-insensitive (2)
 * - match of the beginning of the string case-sensitive (3)
 * - match of the beginning of the string case-insensitive (4)
 * - found part of the string case-sensitive (5)
 * - found a part of the string case-insensitive (6)
 * - found a sequence of characters (elastic search) (7)
 */
export const fullTextSearch = (str: string, query: string, notExactSearch = true): number => {
  const queryLower = query.toLowerCase()
  const queryRe = notExactSearch ? getMomoizedQueryRe(query, queryLower) : undefined
  if (str === query) return 0.1
  const strLower = str.toLowerCase()
  if (strLower === queryLower) return 0.2
  const indexQueryInStr = str.indexOf(query)
  if (indexQueryInStr !== -1) return (indexQueryInStr === 0 ? 0.3 : 0.5)
  const indexQueryInStrLower = strLower.indexOf(queryLower)
  if (indexQueryInStrLower !== -1) return (indexQueryInStrLower === 0 ? 0.4 : 0.6)
  if (queryRe && queryRe.test(strLower)) return 0.7
  return 0
}

const fullTextDeepSearchRecursive = (data: unknown, query: string, queryLower: string, queryRe: RegExp | undefined, level: number, add: number, maxLevels: number, currentStructure?: Structure | boolean) => {
  if (level > maxLevels || currentStructure === false) return 0
  let result = 0

  if (isArray(data)) {
    const len = data.length
    for (let i = 0; i < len; i++) {
      const r = fullTextDeepSearchRecursive(data[i], query, queryLower, queryRe, level, add + 1, maxLevels, currentStructure)
      result = r > 0
        ? (result === 0 ? r : (r < result ? r : result))
        : result
    }
    return result && result * level + add
  }

  if (isObjectLike(data)) {
    const isCurrentStructureDefined = currentStructure != null
    const allKeys = Object.keys(data)
    const keys = isObjectLike(currentStructure)
      ? allKeys.filter((key) => key in currentStructure)
      : allKeys
    const len = keys.length
    for (let i = 0; i < len; i++) {
      const key = keys[i]
      const childStructure = isCurrentStructureDefined
        ? currentStructure === true
          ? false
          : currentStructure[key] ?? false
        : undefined
      const r = fullTextDeepSearchRecursive(data[key], query, queryLower, queryRe, level + 1, 0, maxLevels, childStructure)
      result = r > 0
        ? (result === 0 ? r : (r < result ? r : result))
        : result
    }
    return result && result * level + add
  }

  // Handle Number
  if (isNumber(data)) {
    data = data.toString()
  }

  // Handle String
  if (isString(data)) {
    const toAdd = level + add
    if (data === query) return 0.1 * toAdd
    const dataLower = data.toLowerCase()
    if (dataLower === queryLower) return 0.2 * toAdd
    const indexQueryInData = data.indexOf(query)
    if (indexQueryInData !== -1) return (indexQueryInData === 0 ? 0.3 : 0.5) * toAdd
    const indexQueryInDataLower = dataLower.indexOf(queryLower)
    if (indexQueryInDataLower !== -1) return (indexQueryInDataLower === 0 ? 0.4 : 0.6) * toAdd
    if (queryRe && queryRe.test(dataLower)) return 0.7 * toAdd
  }

  return 0
}

/**
 * Full-text deep object search
 * @param data - object to search
 * @param query - search string
 * @param [maxLevels] - the maximum nesting level for the search, iterating through arrays increases the result by 1, but does not increase the level
 * @param [notExactSearch] - whether to use an accurate search
 * If the search structure is not specified or is not declared in the arguments, the search will occur in all fields
 * @param structure - structure for search
 * @returns number - the priority index is returned, the smaller the number, the greater the priority
 *   the search priority is as follows:
 *     - level match (result * level)
 *       - full match of the found string (0.1)
 *       - full match case-insensitive (0.2)
 *       - match of the beginning of the string case-sensitive (0.3)
 *       - match of the beginning of the string case-insensitive (0.4)
 *       - found part of the string case-sensitive (0.5)
 *       - found part of the string case-insensitive (0.6)
 *       - found a sequence of characters (elastic search) (0.7)
 *     - match at a deeper level (result * level)
 */
export const fullTextDeepSearch = (data: unknown, query: string, notExactSearch = true, maxLevels = Infinity, structure?: Structure): number => {
  const queryLower = query.toLowerCase()
  const queryRe = notExactSearch ? getMomoizedQueryRe(query, queryLower) : undefined

  return fullTextDeepSearchRecursive(data, query, queryLower, queryRe, 1, 0, maxLevels, structure)
}

export type NodeCallback<T> = (err?: Error, result?: T) => void
export const promisifyCall = <T>(method: (callback: NodeCallback<T>) => void): Promise<T> => {
  return new Promise((resolve, reject) => {
    method((err, result) => {
      if (err) reject(err)
      resolve(result as T)
    })
  })
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 */
export const debounce = <TArgs extends unknown[]>(func: (...args: TArgs) => void, timeout: number): [wrappedFn: (...args: TArgs) => void, clear: () => void] => {
  let timeoutId: number | undefined
  return [
    (...args: TArgs): void => {
      const later = () => {
        timeoutId = undefined
        func(...args)
      }
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(later, timeout)
    },
    () => clearTimeout(timeoutId)
  ]
}

/**
 * Returns a function, that will be triggered, and then, as long as it continues to be invoked,
 * will not be triggered. The function can be triggered again after it stops being called for
 * N milliseconds.
 */
export const throttle = <TArgs extends unknown[]>(func: (...args: TArgs) => void, timeout: number): [wrappedFn: (...args: TArgs) => void, clear: () => void] => {
  let timeoutId: number | undefined
  return [
    (...args: TArgs): void => {
      const later = () => {
        timeoutId = undefined
      }
      const callNow = !timeout
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(later, timeout)
      if (callNow) func(...args)
    },
    () => clearTimeout(timeoutId)
  ]
}

/**
 * Returns a function, which only invokes the passed function at most once per animation frame on a browser.
 * The function will be called with the arguments of the last call before frame accured.
 */
export const throttleRequestAnimationFrame = <TArgs extends unknown[]>(fn: (...args: TArgs) => void): [wrappedFn: (...args: TArgs) => void, clear: () => void] => {
  let requestId: number | undefined

  let lastArgs: TArgs

  const throttled = (...args: TArgs) => {
    lastArgs = args
    if (requestId == null) {
      requestId = requestAnimationFrame(() => {
        requestId = undefined
        fn(...lastArgs)
      })
    }
  }

  const clear = () => {
    if (requestId == null) return
    cancelAnimationFrame(requestId)
    requestId = undefined
  }

  return [throttled, clear]
}

export const createImageElement = (src?: string): HTMLImageElement => {
  const img = new Image()
  if (src) img.src = src
  return img
}

export const loadImg = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = createImageElement(src)
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

export interface Group<T, Key extends number | string = number | string> {
  key: Key
  items: T[]
}

export const objectGroupBy = <T, Key extends number | string = number | string>(arr: T[], groupKeyGetter: (item: T) => Key): Record<Key, T[]> => {
  const groupsMap: Record<Key, T[]> = {} as Record<Key, T[]>
  arr.forEach((item) => {
    const key = groupKeyGetter(item)
    const group = groupsMap[key] ?? (groupsMap[key] = [])
    group.push(item)
  })
  return groupsMap
}

export const groupBy = <T, Key extends number | string = number | string>(arr: T[], groupKeyGetter: (item: T) => Key): Group<T, Key>[] => {
  const groupsMap = objectGroupBy(arr, groupKeyGetter)
  return objectEntries(groupsMap).map(([key, items]) => ({ key, items }))
}

export const unwrapArray = <T>(arrOrValue: T[] | T): T => isArray(arrOrValue) ? arrOrValue[0] : arrOrValue

export interface FormatNumberOptions {
  integerLength?: number
  fractionalLength?: number
  fixSign?: boolean
}

const zeroes = new Array(32).join('0')
const spaces = new Array(32).join(' ') // non-breaking spaces

export const formatNumber = (num: number, { integerLength = 1, fractionalLength = 0, fixSign = false }: FormatNumberOptions = {}): string => {
  const [iStr, fStr] = (num < 0 ? -num : num).toString().split('.')
  const iLenDiff = integerLength - iStr.length
  const fLenDiff = fStr !== undefined ? fractionalLength - fStr.length : 0
  return (num < 0 ? '-' : (fixSign ? ' ' : '')) + // non-breaking space
    (iLenDiff > 0 ? zeroes.slice(0, iLenDiff) + iStr : iStr) +
    (fStr !== undefined
      ? '.' + (fLenDiff > 0 ? fStr + zeroes.slice(0, fLenDiff) : fStr)
      : (fractionalLength ? spaces.slice(0, fractionalLength + 1) : ''))
}

export interface IsEqualOptions {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: (key: string | number, a: unknown, b: unknown) => boolean
}

export const isEqual = (a: unknown, b: unknown, options?: IsEqualOptions): boolean => {
  const filter = options?.filter
  if (isArray(b)) {
    if (!isArray(a)) return false
    if (filter) {
      const len = Math.max(a.length, b.length)
      for (let i = 0; i < len; i++) {
        if (!filter(i, a, b)) continue
        if (!isEqual(a[i], b[i], options)) return false
      }
    } else {
      if (a.length !== b.length) return false
      const len = b.length
      for (let i = 0; i < len; i++) {
        if (!isEqual(a[i], b[i], options)) return false
      }
    }
    return true
  }

  if (isDate(b)) {
    if (!a || !isDate(a)) return false
    return a.getTime() === b.getTime()
  }

  if (isObjectLike(b)) {
    if (!a || !isObjectLike(a)) return false
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (filter) {
      const checkedKeys = new Set<string>()
      for (const key of keysB) {
        checkedKeys.add(key)
        if (!filter(key, a, b)) continue
        if (!isEqual(a[key], b[key], options)) return false
      }
      for (const key of keysA) {
        if (checkedKeys.has(key)) continue
        if (!filter(key, a, b)) continue
        if (!isEqual(a[key], b[key], options)) return false
      }
    } else {
      if (keysA.length !== keysB.length) return false
      for (const key of keysB) {
        if (!isEqual(a[key], b[key], options)) return false
      }
    }
    return true
  }

  return a === b
}

export interface DeepMergeOptions {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: (key: string | number, from: unknown, to: unknown) => boolean
  /**
   * If true, arrays of the same level will be connected
   */
  concatArrays?: boolean
}

/**
* Deeply mixes all the object's own fields into another, keeping
* upper-level data, if it already exists in the source object.
* Copies undefined fields if there are none, but does not overwrite existing ones.
*/
export const deepMerge = <TTo, TFrom>(to: TTo, from: TFrom, options: DeepMergeOptions = {}): TTo & TFrom => {
  const { filter, concatArrays } = options
  type InnerDeepMerge = {
    (to: unknown[], from: unknown[], key: number): void
    (to: Record<string, unknown>, from: Record<string, unknown>, key: string): void
  }
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const innerDeepMerge: InnerDeepMerge = (to: any, from: any, key: string | number) => {
    if (filter && filter(key, from, to) === false) {
      return to
    }

    const field: unknown = (from as any)[key]

    if (field === undefined) {
      if (!(key in to)) {
        to[key] = field
      }
      return
    } else if (!isObjectLike(field)) {
      to[key] = field
      return
    }

    if (isArray(field)) {
      if (!isArray(to[key])) {
        to[key] = []
      }
      if (concatArrays) {
        to[key] = from[key].concat(to[key])
      } else {
        for (let i = 0; i < field.length; i++) {
          innerDeepMerge(to[key], field, i)
        }
      }
      return
    }

    if (!to[key] || !(to[key] instanceof Object)) {
      to[key] = Object.create(Object.getPrototypeOf(field))
    }
    const keys = Object.keys(field)
    keys.forEach((k) => {
      innerDeepMerge(to[key], field, k)
    })
  }

  if (!isObjectLike(from)) {
    return to as any
  }

  if (isArray(from) && isArray(to)) {
    let newTo: any = to
    if (concatArrays) {
      newTo = [...from, ...to]
    } else {
      from.forEach((_item, i) => {
        innerDeepMerge(newTo, from, i)
      })
    }
    return newTo
  }

  if (from instanceof Object && to instanceof Object) {
    const keys = Object.keys(from)
    keys.forEach((k) => {
      innerDeepMerge(to as Record<string, unknown>, from, k)
    })
  }

  return to as any
}

export interface DeepCloneOptions {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: (key: string | number, from: unknown, copy: unknown) => boolean
  /**
   * Sort keys in the result object alphabetically
   */
  sortKeys?: boolean
}

/**
 * Deeply clones all the object's own fields into a new one
 * @param from - Source
 * @return Source clone
 */
export const deepClone = <T>(from: T, options: DeepCloneOptions = {}): T => {
  if (!isObjectLike(from)) return from

  if (isArray(from)) {
    const copy: any = []
    from.forEach((item, i) => {
      copy[i] = deepClone(item, options)
    })
    return copy
  }

  const copy = Object.create(Object.getPrototypeOf(from))
  const keys = Object.keys(from)
  if (options.sortKeys) keys.sort((a, b) => a < b ? -1 : 1)
  keys.forEach((k) => {
    if (options.filter && options.filter(k, from, copy) === false) return
    copy[k] = deepClone(from[k], options)
  })
  return copy
}

export interface FlattenOptions {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: (path: string, key: string | number, from: unknown, to: unknown) => boolean
  separator?: string
}

/**
 * Collapses all internal properties into one object with keys made up of paths to the property
 */
export const flattenObject = (from: unknown, { separator = '.', filter }: FlattenOptions = {}): Record<string, unknown> => {
  if (!isObjectLike(from)) return {}

  const to: Record<string, unknown> = {}

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const innerFlatten = (from: unknown, path: string, key: string | number) => {
    if (filter && filter(path, key, from, to) === false) return
    if (!isObjectLike(from)) return

    const field = from[key]

    if (!isObjectLike(field)) {
      to[path] = field
      return
    }

    if (isArray(field)) {
      for (let i = 0; i < field.length; i++) {
        innerFlatten(field, path + separator + i, i)
      }
      return
    }

    const keys = Object.keys(field)
    keys.forEach((k) => {
      innerFlatten(field, path + separator + k, k)
    })
  }

  if (isArray(from)) {
    from.forEach((_item, i) => {
      innerFlatten(from, i.toString(), i)
    })
    return to
  }

  const keys = Object.keys(from)
  keys.forEach((k) => {
    innerFlatten(from, k, k)
  })

  return to
}

export type KeyGetter<T> = (item: T) => string | number

export const uniqueSet = <T>(array: T[], key?: keyof T | KeyGetter<T>): Set<T> => {
  const keyGetter: KeyGetter<T> = key == null
    ? identity as KeyGetter<T>
    : isFunction(key)
      ? key
      : ((item: T) => item[key as keyof T]) as unknown as KeyGetter<T>

  const keySet = new Set<any>()
  array.forEach((item) => {
    const k = keyGetter(item)
    if (keySet.has(k)) return
    keySet.add(k)
  })
  return keySet
}

export const unique = <T>(array: T[], key?: keyof T | KeyGetter<T>): T[] => {
  const keyGetter: KeyGetter<T> = key == null
    ? identity as KeyGetter<T>
    : isFunction(key)
      ? key
      : ((item: T) => item[key as keyof T]) as unknown as KeyGetter<T>

  const keySet = new Set<any>()
  const result: T[] = []
  array.forEach((item) => {
    const k = keyGetter(item)
    if (keySet.has(k)) return
    keySet.add(k)
    result.push(item)
  })
  return result
}

const kb = 1 << 10
const mb = kb << 10
const gb = mb << 10
const tb = gb * 1024 // int overflow :)

const round100 = (value: number) => {
  return Math.round(value * 100) / 100
}

export enum ByteSizeUnit {
  Byte = 'byte',
  Kilobyte = 'kilobyte',
  Magabyte = 'magabyte',
  Gigabyte = 'gigabyte',
  Terabyte = 'terabyte'
}

export type ByteSizeUnitResult = [number, ByteSizeUnit]

export const byteSizeUnit = (size: number): ByteSizeUnitResult => {
  if (size < 0.1 * kb) {
    return [round100(size), ByteSizeUnit.Byte]
  } else if (size < 100 * kb) {
    return [round100(size / kb), ByteSizeUnit.Kilobyte]
  } else if (size < 100 * mb) {
    return [round100(size / mb), ByteSizeUnit.Magabyte]
  } else if (size < 100 * gb) {
    return [round100(size / gb), ByteSizeUnit.Gigabyte]
  } else {
    return [round100(size / tb), ByteSizeUnit.Terabyte]
  }
}

export type QueryParameter = string | number | boolean | null | undefined
export type QueryParameterOrArray = QueryParameter | QueryParameter[]
export type QueryParameters = Record<string, QueryParameterOrArray>

export const queryStringFromObject = (params: QueryParameters) => {
  const query: string[] = []

  Object.entries(params).forEach(([key, param]) => {
    const k = key + '='
    if (isArray(param)) {
      param.forEach((p) => query.push(k + p))
    } else {
      query.push(k + param)
    }
  })
  return query.length > 0
    ? '?' + query.join('&')
    : ''
}

export const addEventListener = (target: EventTarget, event: string, listener: EventListenerOrEventListenerObject): (() => void) => {
  target.addEventListener(event, listener)
  return () => {
    target.removeEventListener(event, listener)
  }
}

const scriptPromises: Record<string, Promise<unknown>> = {}

export const loadScripts = (srces: string[]) => {
  return Promise.all(srces.map((src) => loadScript(src)))
}

export const loadScript = (src: string): Promise<unknown> => {
  if (src in scriptPromises) {
    return scriptPromises[src]
  }
  scriptPromises[src] = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = resolve
    script.onerror = reject
    script.src = src
    const headChild = document.getElementsByTagName('head')[0].firstChild
    document.getElementsByTagName('head')[0].insertBefore(script, headChild)
  })
  return scriptPromises[src]
}

const stylePromises: Record<string, Promise<unknown>> = {}

export const loadStyle = (src: string): Promise<unknown> => {
  if (src in stylePromises) {
    return stylePromises[src]
  }
  stylePromises[src] = new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = src
    link.media = 'all'
    const headChild = document.getElementsByTagName('head')[0].firstChild
    document.getElementsByTagName('head')[0].insertBefore(link, headChild)
  })
  return stylePromises[src]
}

export const downloadFile = (urlOrBlob: string | Blob, fileName = 'download') => {
  const link = document.createElement('a')
  link.download = fileName
  link.href = isString(urlOrBlob) ? urlOrBlob : URL.createObjectURL(urlOrBlob)
  document.body.appendChild(link)
  link.dispatchEvent(new MouseEvent('click'))
  setTimeout(() => {
    document.body.removeChild(link)
    if (isString(urlOrBlob)) URL.revokeObjectURL(urlOrBlob)
  })
}

export const getContentDispositionFileName = (contentDispositionHeader: string | undefined | null, altName: string) => {
  if (!contentDispositionHeader) return altName
  const parts = contentDispositionHeader.split(';').map((s) => s.trim()).reduce((map, part) => {
    const [key, value] = part.split('=').map((s) => s.trim())
    map[key] = value && value.startsWith('"') && value.endsWith('"')
      ? value.slice(1, -1)
      : value
    return map
  }, {} as Record<string, string | undefined>)
  return parts.filename || altName
}

export const fileToBase64 = (file: File): Promise<string | undefined> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result ? reader.result.toString() : undefined)
  reader.onerror = (error) => reject(error)
})

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(v, min))

export const hashCode = (str: string): number => {
  let hash = 0
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export const createIntegerIdCounter = () => {
  let idCounter = 0
  return () => ++idCounter
}

export const getOrSetDefault = <Key, T>(map: Map<Key, T>, key: Key, makeDefault: () => T): T => {
  if (map.has(key)) return map.get(key)!
  const newValue = makeDefault()
  map.set(key, newValue)
  return newValue
}
