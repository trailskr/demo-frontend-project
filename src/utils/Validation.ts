import { and, array, dateTime, email, empty, equals, inList, integer, length, max, maxDateTime, maxLength, maxTimesInList, min, minDateTime, minLength, notEquals, notInList, number, object, objectLike, or, pattern, required, string, url } from '@/utils/validators'

import { Path, get } from './path'
import { isFunction, isObjectLike, isArray, isString, isBoolean } from './typecheck'

/* eslint-disable no-use-before-define */
export interface ValidationError {
  rule: string
  path: Path
  message: string
  fromKey?: Key
}

export type ValidationMessage = string | ((val: unknown) => string)

const getMessage = (msg: ValidationMessage, val: unknown): string => isString(msg) ? msg : msg(val)

export type Validator = (v: unknown, fullPath: Path) => boolean

export type Enabled = boolean | Validator

export type Key = number | string
export type KeyGetter = (item: any) => Key
export type KeyGetterDef = Key | KeyGetter

const getKeyGetter = (keyGetterDef: KeyGetterDef): KeyGetter => {
  return isFunction(keyGetterDef) ? keyGetterDef : (item: any) => item?.[keyGetterDef]
}

export interface ValidationRule {
  validator: Validator
  message: ValidationMessage
  enabled?: Enabled
}

const isEnabled = (val: unknown, fullPath: Path, enabled: Enabled | undefined): boolean => {
  if (enabled == null) return true
  if (isBoolean(enabled)) return enabled
  return enabled(val, fullPath)
}

export interface ValidationOptions {
  rules?: Record<string, ValidationRule>
  fields?: Record<string, ValidationOptions>
  children?: Record<string, ValidationOptions>
}

export type ValidatorFactory = () => Validation

export type AggregationOptions = ValidationOptions | ValidatorFactory

const getValidatorFactory = (aggregationOptions: AggregationOptions): ValidatorFactory => {
  return isFunction(aggregationOptions)
    ? aggregationOptions
    : () => new Validation(aggregationOptions)
}

export class Validation {
  private _parent: Validation | undefined
  private _key?: Key
  private _isEnabled: Enabled = true
  private _isValid = true
  private _isSelfValid = true
  private _isDirty = false
  private _errors: ValidationError[] = []
  private _rules?: Record<string, ValidationRule>
  private _lastRule?: ValidationRule

  private _fields?: Record<string, Validation>
  private _children?: Record<string, Validation>

  private _everyValidatorFactory?: ValidatorFactory
  private _everyKeyGetter?: KeyGetter
  private _every?: Map<Key, Validation>

  private _someValidatorFactory?: ValidatorFactory
  private _someKeyGetter?: KeyGetter
  private _some?: Map<Key, Validation>

  constructor ({ rules, fields, children }: ValidationOptions = {}) {
    this._rules = rules
    if (fields) {
      this._fields = {}
      Object.entries(fields).forEach(([key, options]) => {
        const validation = new Validation(options)
        this._addChild(validation, key)
        this._fields![key] = validation
      })
    }
    if (children) {
      this._children = {}
      Object.entries(children).forEach(([key, options]) => {
        const validation = new Validation(options)
        this._addChild(validation)
        this._children![key] = validation
      })
    }
  }

  private _addChild (validation: Validation, key?: Key): void {
    validation._parent = this
    validation._key = key
  }

  private _iterateChildren (fn: (child: Validation, path: Path) => void): void {
    if (this._every) {
      for (const [key, validation] of this._every) {
        fn(validation, [key])
      }
    }
    if (this._fields) {
      Object.entries(this._fields).forEach(([key, validation]) => fn(validation, [key]))
    }
  }

  rule (name: string, validator: Validator, message?: ValidationMessage): typeof this {
    this._rules = this._rules ?? {}
    this._lastRule = {
      validator,
      message: message ?? name
    }
    this._rules[name] = this._lastRule
    return this
  }

  addField (field: string, validation: Validation): typeof this {
    this._fields = this._fields ?? {}
    this._fields![field] = validation
    this._addChild(validation, field)
    return this
  }

  addFields (fields: Record<string, Validation>): typeof this {
    Object.entries(fields).forEach(([key, validation]) => {
      this.addField(key, validation)
    })
    return this
  }

  addChild (childName: string, validation: Validation): typeof this {
    this._children = this._children ?? {}
    this._children![childName] = validation
    this._addChild(validation)
    return this
  }

  addChildren (children: Record<string, Validation>): typeof this {
    Object.entries(children).forEach(([key, validation]) => {
      this.addChild(key, validation)
    })
    return this
  }

  /**
   * When you use keyGetterDef for array of objects,
   * path will cantain this key instead of index
   * */
  addEvery (aggregationOption: AggregationOptions, keyGetterDef?: KeyGetterDef): typeof this {
    this._everyValidatorFactory = getValidatorFactory(aggregationOption)
    this._everyKeyGetter = keyGetterDef ? getKeyGetter(keyGetterDef) : undefined
    return this
  }

  /**
   * When you use keyGetterDef for array of objects,
   * path will cantain this key instead of index
   * */
  addSome (aggregationOption: AggregationOptions, keyGetterDef?: KeyGetterDef): typeof this {
    this._someValidatorFactory = getValidatorFactory(aggregationOption)
    this._someKeyGetter = keyGetterDef ? getKeyGetter(keyGetterDef) : undefined
    return this
  }

  getFullPath (): Path {
    return this._key == null
      ? this._parent
        ? this._parent.getFullPath()
        : []
      : this._parent
        ? [...this._parent.getFullPath(), this._key]
        : [this._key]
  }

  addRuleError (key: string, message: string): void {
    this._errors.push({
      path: [],
      rule: key,
      message,
      fromKey: this._key
    })
    this._isValid = false
    this._isSelfValid = false
    this._parent?._addChildErrors(this)
  }

  private _validateRules (val: unknown): void {
    if (!this._rules) return
    const fullPath = this.getFullPath()
    Object.entries(this._rules).forEach(([key, { validator, message, enabled }]) => {
      if (!isEnabled(val, fullPath, enabled) || validator(val, fullPath)) return
      this._errors.push({
        path: [],
        rule: key,
        message: getMessage(message, val),
        fromKey: this._key
      })
      this._isValid = false
      this._isSelfValid = false
    })
  }

  private _validateEvery (val: unknown): void {
    const validatorFactory = this._everyValidatorFactory
    if (!validatorFactory) return
    if (!isObjectLike(val)) {
      this._every = undefined
      return
    }
    this._every = this._every ?? new Map()
    const usedKeys = new Set<Key>()
    const keyGetter = this._everyKeyGetter
    const entries: [key: Key, item: unknown][] = isArray(val)
      ? keyGetter
        ? val.map((item, index) => ([keyGetter(item), item]))
        : val.map((item, index) => ([index, item]))
      : Object.entries(val)
    entries.forEach(([key, item]) => {
      usedKeys.add(key)
      const validation = this._every!.get(key) ?? validatorFactory()
      this._addChild(validation, key)
      this._every!.set(key, validation)
      validation._test(item)
    })
    for (const key of this._every.keys()) {
      if (!usedKeys.has(key)) this._every!.delete(key)
    }
  }

  private _validateSome (val: unknown): void {
    const validatorFactory = this._someValidatorFactory
    if (!validatorFactory) return
    if (!isObjectLike(val)) {
      this._some = undefined
      return
    }
    this._some = this._some ?? new Map()
    const usedKeys = new Set<Key>()
    const keyGetter = this._someKeyGetter
    const entries: [key: Key, item: unknown][] = isArray(val)
      ? keyGetter
        ? val.map((item, index) => ([keyGetter(item), item]))
        : val.map((item, index) => ([index, item]))
      : Object.entries(val)

    let isValid = false
    entries.forEach(([key, item]) => {
      usedKeys.add(key)
      const validation = this._some!.get(key) ?? validatorFactory()
      this._addChild(validation, key)
      this._some!.set(key, validation)
      validation._test(item, true)
      if (validation._isValid) isValid = true
    })
    for (const key of this._some.keys()) {
      if (!usedKeys.has(key)) this._some!.delete(key)
    }
    if (!isValid) {
      for (const validation of this._some.values()) {
        this._addChildErrors(validation)
      }
      this._isValid = false
    }
  }

  private _validateFields (val: unknown): void {
    if (val == null || !this._fields) return
    Object.entries(this._fields).forEach(([key, validation]) => {
      const fieldValue = get(val, [key])
      validation._test(fieldValue)
    })
  }

  private _validateChildren (val: unknown): void {
    if (val == null || !this._children) return
    Object.values(this._children).forEach((validation) => {
      validation._test(val)
    })
  }

  private _test (val: unknown, skipAddErrors = false) {
    this._errors = []
    this._isDirty = true
    this._isValid = true
    this._isSelfValid = true

    if (!isEnabled(val, this.getFullPath(), this._isEnabled)) return

    this._validateRules(val)

    // children
    this._validateEvery(val)
    this._validateSome(val)
    this._validateFields(val)
    this._validateChildren(val)
    if (!skipAddErrors) this._parent?._addChildErrors(this)
  }

  test (val: unknown) {
    this._test(val)
    this._parent?._revalidateParentChain(this)
    return this._isValid
  }

  reset () {
    this._isValid = true
    this._isSelfValid = true
    this._isDirty = false
    this._errors = []
    this._iterateChildren((validation) => validation.reset())
    this._parent?._revalidateParentChain(this)
  }

  msg (message: ValidationMessage): typeof this {
    const lastRule = this._lastRule
    if (!lastRule) throw new Error('last rule is not set')
    lastRule.message = message
    return this
  }

  ruleEnabled (enabled: Enabled): typeof this {
    const lastRule = this._lastRule
    if (!lastRule) throw new Error('last rule is not set')
    lastRule.enabled = enabled
    return this
  }

  enabled (enabled: Enabled): typeof this {
    this._isEnabled = enabled
    return this
  }

  private _addChildErrors (childValidation: Validation): void {
    const childErrors = childValidation._errors.map(({ path, rule, message }) => ({
      path: childValidation._key != null ? [childValidation._key, ...path] : path,
      rule,
      message,
      fromKey: childValidation._key
    }))
    this._errors.push(...childErrors)
    this._isValid = this._errors.length === 0
  }

  private _revalidateParentChain (childValidation: Validation): void {
    this._errors = this._errors.filter((err) => err.fromKey !== childValidation._key)
    this._addChildErrors(childValidation)
    this._parent?._revalidateParentChain(this)
  }

  getEvery (key: Key): Validation {
    const validationFactrory = this._everyValidatorFactory
    if (!validationFactrory) throw new Error('no every rule')
    this._every = this._every ?? new Map()
    const validation = this._every!.get(key)
    if (validation) return validation
    const newValidation = validationFactrory()
    this._addChild(newValidation, key)
    this._every!.set(key, newValidation)
    return newValidation
  }

  getSome (key: Key): Validation {
    const validationFactrory = this._someValidatorFactory
    if (!validationFactrory) throw new Error('no some rule')
    this._some = this._some ?? new Map()
    const validation = this._some!.get(key)
    if (validation) return validation
    const newValidation = validationFactrory()
    this._addChild(newValidation, key)
    this._some!.set(key, newValidation)
    return newValidation
  }

  get (value: any, path: Path): Validation {
    if (path.length === 0) return this
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let validation: Validation | undefined = this
    let val = value
    for (const key of path) {
      const keyValue = val == null ? undefined : val[key]
      ;[validation, val] = validation._fields && key in validation._fields
        ? [validation._fields[key], keyValue]
        : validation._children && key in validation._children
          ? [validation._children[key], keyValue]
          : validation._everyValidatorFactory != null
            ? [validation.getEvery(key), keyValue]
            : validation._someValidatorFactory != null
              ? [validation.getSome(key), keyValue]
              : [undefined, undefined]
      if (validation == null) throw new Error('path is not found')
    }
    return validation
  }

  get isValid () { return this._isValid }
  get isSelfValid () { return this._isSelfValid }
  get isInvalid () { return !this._isValid }
  get isSelfInvalid () { return !this._isSelfValid }
  get isDirty () { return this._isDirty }
  get errors () { return this._errors }
  get selfErrors () { return this._errors.filter((error) => error.fromKey === this._key) }
  get fields () { return this._fields ?? {} }
  get children () { return this._children ?? {} }

  empty () { return this.rule('empty', empty) }
  required () { return this.rule('required', required) }
  number () { return this.rule('number', number) }
  integer () { return this.rule('integer', integer) }
  string () { return this.rule('string', string) }
  objectLike () { return this.rule('objectLike', objectLike) }
  object () { return this.rule('object', object) }
  array () { return this.rule('array', array) }
  dateTime () { return this.rule('dateTime', dateTime) }
  email () { return this.rule('email', email) }
  url () { return this.rule('url', url) }

  length (...args: Parameters<typeof length>) { return this.rule('length', length(...args)) }
  minLength (...args: Parameters<typeof minLength>) { return this.rule('minLength', minLength(...args)) }
  maxLength (...args: Parameters<typeof maxLength>) { return this.rule('maxLength', maxLength(...args)) }
  equals (...args: Parameters<typeof equals>) { return this.rule('equals', equals(...args)) }
  notEquals (...args: Parameters<typeof notEquals>) { return this.rule('notEquals', notEquals(...args)) }
  min (...args: Parameters<typeof min>) { return this.rule('min', min(...args)) }
  max (...args: Parameters<typeof max>) { return this.rule('max', max(...args)) }
  pattern (...args: Parameters<typeof pattern>) { return this.rule('pattern', pattern(...args)) }
  inList (...args: Parameters<typeof inList>) { return this.rule('inList', inList(...args)) }
  maxTimesInList (...args: Parameters<typeof maxTimesInList>) { return this.rule('maxTimesInList', maxTimesInList(...args)) }
  notInList (...args: Parameters<typeof notInList>) { return this.rule('notInList', notInList(...args)) }
  minDateTime (...args: Parameters<typeof minDateTime>) { return this.rule('minDateTime', minDateTime(...args)) }
  maxDateTime (...args: Parameters<typeof maxDateTime>) { return this.rule('maxDateTime', maxDateTime(...args)) }
  and (...args: Parameters<typeof and>) { return this.rule('and', and(...args)) }
  or (...args: Parameters<typeof or>) { return this.rule('or', or(...args)) }
}

export const v = (options?: ValidationOptions) => new Validation(options)

// window.v = v
// window.and = and
// window.array = array
// window.dateTime = dateTime
// window.email = email
// window.empty = empty
// window.equals = equals
// window.inList = inList
// window.integer = integer
// window.length = length
// window.max = max
// window.maxDateTime = maxDateTime
// window.maxLength = maxLength
// window.maxTimesInList = maxTimesInList
// window.min = min
// window.minDateTime = minDateTime
// window.minLength = minLength
// window.notEquals = notEquals
// window.notInList = notInList
// window.number = number
// window.object = object
// window.objectLike = objectLike
// window.or = or
// window.pattern = pattern
// window.required = required
// window.string = string
// window.url = url
