export const isNumber = (v: unknown): v is number => typeof v === 'number'
export const isString = (v: unknown): v is string => typeof v === 'string'
export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'
export const isVoid = (v: unknown): v is null | undefined => v == null
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = <T extends Function>(v: unknown): v is T => typeof v === 'function'
export const isObject = <K extends string | number | symbol = string, T = unknown>(v: unknown): v is Record<K, T> => {
  return Object.prototype.toString.call(v) === '[object Object]'
}
export const isDate = (v: unknown): v is Date => {
  return Object.prototype.toString.call(v) === '[object Date]'
}
export const isObjectLike = <K extends string | number | symbol = string, T = unknown>(v: unknown): v is Record<K, T> & T[] => {
  return typeof v === 'object' && v !== null
}
export const isArray = <T = unknown>(v: unknown): v is T[] => Array.isArray(v)
export const isPromise = <T = unknown>(v: unknown): v is Promise<T> => {
  return isObjectLike(v) &&
    typeof v.then === 'function' &&
    typeof v.catch === 'function' &&
    typeof v.finally === 'function'
}
