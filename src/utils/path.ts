import { isArray, isNumber, isObjectLike } from './typecheck'

const pathElementRE = /(?:^|(?:\.|\[(["'])?))(\d+|[A-Za-z_$][0-9A-Za-z_$]*)]?/g

export type Path = (string | number)[]

/**
 * compile paths like "item['field'].data[0]" to array of keys ['item', 'field', 'data', 0]
 */
export const compilePath = (path: string): Path => {
  const compiled: Path = []
  let result
  while (true) {
    result = pathElementRE.exec(path)
    if (!result) break
    const field = result[2]
    if (result[1] == null && !isNaN(+field)) compiled.push(parseInt(field))
    else compiled.push(field)
  }
  pathElementRE.lastIndex = 0
  return compiled
}

/**
 * Getting data along the path in an object
 */
export const get = (obj: unknown, path: Path): unknown | undefined => {
  if (!obj) return undefined
  if (path.length === 0) return obj
  let ref: any = obj
  let i, maxi
  for (i = 0, maxi = path.length - 1; i < maxi; i++) {
    const key = path[i]
    ref = ref[key]
    if (!ref) return undefined
  }
  return ref[path[i]]
}

/**
 * Writing data along the path in the object, missing objects and arrays will be created
 */
export const set = (obj: unknown, path: Path, val: unknown): void => {
  if (!obj) return
  let ref: any = obj
  let key, i, maxi
  for (i = 0, maxi = path.length - 1; i < maxi; i++) {
    key = path[i]
    if (isNumber(path[i + 1]) && !isArray(ref[key])) {
      ref[key] = []
    } else if (!ref[key] || !isObjectLike(ref[key])) {
      ref[key] = {}
    }
    ref = ref[key]
  }
  ref[path[i]] = val
}
