import { isString, isNumber, isArray, isVoid, isDate, isObjectLike, isObject, isFunction } from './typecheck'
import { isEqual } from './utils'

const isNotPresent = (v: unknown) => isVoid(v) || v === ''

export type Validator = (v: unknown) => boolean

// without params
export const empty: Validator = (v: unknown): boolean => isNotPresent(v) || (isString(v) && v.trim().length === 0) || (isArray(v) && v.length === 0) || (isObjectLike(v) && Object.keys(v).length === 0)
export const required: Validator = (v: unknown): boolean => !(isNotPresent(v) || (isString(v) && v.trim().length === 0))
export const number: Validator = (v: unknown): boolean => isNotPresent(v) || (isNumber(v) && Number.isFinite(v))
export const string: Validator = (v: unknown): boolean => isNotPresent(v) || isString(v)
export const objectLike: Validator = (v: unknown): boolean => isNotPresent(v) || isObjectLike(v)
export const object: Validator = (v: unknown): boolean => isNotPresent(v) || isObject(v)
export const array: Validator = (v: unknown): boolean => isNotPresent(v) || isArray(v)
export const dateTime = (v: unknown): boolean => isNotPresent(v) || (isDateValue(v) && !isNaN(getTime(v)))

const integerMin = 1 << 31
const integerMax = -integerMin - 1
export const integer: Validator = (v: unknown): boolean => {
  if (isNotPresent(v)) return true
  if (!isNumber(v)) return false
  return Math.floor(v) === v && v >= integerMin && v <= integerMax
}

export type equalFunction = (a: unknown, b: unknown) => boolean

// with params
export const length = (len: number) => (v: unknown): boolean => isNotPresent(v) || ((isString(v) || isArray(v)) && v.length === len)
export const minLength = (len: number) => (v: unknown): boolean => isNotPresent(v) || ((isString(v) || isArray(v)) && v.length >= len)
export const maxLength = (len: number) => (v: unknown): boolean => isNotPresent(v) || ((isString(v) || isArray(v)) && v.length <= len)
export const equals = (toEq: unknown, equalFn: equalFunction = isEqual) => (v: unknown) => isVoid(toEq) ? v === toEq : isNotPresent(v) || equalFn(v, toEq)
export const notEquals = (toEq: unknown, equalFn: equalFunction = isEqual) => (v: unknown) => isVoid(toEq) ? v !== toEq : isNotPresent(v) || !equalFn(v, toEq)
export const min = (minV: unknown) => (v: unknown): boolean => isNotPresent(v) || isNotPresent(minV) || (((isNumber(v) && isNumber(minV)) || (isString(v) && isString(minV))) && (v >= minV))
export const max = (maxV: unknown) => (v: unknown): boolean => isNotPresent(v) || isNotPresent(maxV) || (((isNumber(v) && isNumber(maxV)) || (isString(v) && isString(maxV))) && (v <= maxV))
export const pattern = (pat: string | RegExp) => {
  const re = isString(pat) ? new RegExp(pat) : pat
  return (v: unknown): boolean => isNotPresent(v) || (isString(v) && re.test(v))
}

export const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const urlRe = /(https?:\/\/)?(www\.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)|(https?:\/\/)?(www\.)?(?!ww)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/
export const email = pattern(emailRe)
export const url = pattern(urlRe)

export type ListGetter = () => unknown[]
const getList = (list: unknown[] | ListGetter) => isFunction(list) ? list() : list

export const inList = (list: unknown[] | ListGetter, equalFn: equalFunction = isEqual) => (v: unknown): boolean => isNotPresent(v) || getList(list).some((item) => equalFn(item, v))
export const notInList = (list: unknown[] | ListGetter, equalFn: equalFunction = isEqual) => (v: unknown): boolean => isNotPresent(v) || !getList(list).some((item) => equalFn(item, v))
export const maxTimesInList = (list: unknown[] | ListGetter, maxTimes: number, equalFn: equalFunction = isEqual) => (v: unknown): boolean => {
  if (isNotPresent(v)) return true
  let times = 0
  return getList(list).every((item) => {
    if (equalFn(item, v)) times++
    return times <= maxTimes
  })
}

const isDateValue = (v: unknown): v is string | number | Date => isString(v) || isNumber(v) || isDate(v)
const getTime = (v: string | number | Date): number => isDate(v) ? v.getTime() : new Date(v).getTime()

export const minDateTime = (minDate: string | number | Date) => (v: unknown): boolean => isNotPresent(v) || !isDateValue(v) || getTime(v) >= getTime(minDate)
export const maxDateTime = (maxDate: string | number | Date) => (v: unknown): boolean => isNotPresent(v) || !isDateValue(v) || getTime(v) <= getTime(maxDate)

const getValidators = (args: Validator[] | Validator[][]): Validator[] => {
  const firstArg = args[0]
  return isArray(firstArg) ? firstArg : args as Validator[]
}
export interface ValidatorAggregator {
  (...args: Validator[]): Validator
  (validators: Validator[]): Validator
}
export const and: ValidatorAggregator = (...args: Validator[] | Validator[][]) => (v: unknown): boolean => getValidators(args).every((validator) => validator(v))
export const or: ValidatorAggregator = (...args: Validator[] | Validator[][]) => (v: unknown): boolean => getValidators(args).some((validator) => validator(v))

export const every = (validator: Validator) => (v: unknown): boolean => {
  if (isArray(v)) return v.every((item) => validator(item))
  if (isObjectLike(v)) return Object.values(v).every((item) => validator(item))
  return true
}

export const some = (validator: Validator) => (v: unknown): boolean => {
  if (isArray(v)) return v.some((item) => validator(item))
  if (isObjectLike(v)) return Object.values(v).some((item) => validator(item))
  return true
}
