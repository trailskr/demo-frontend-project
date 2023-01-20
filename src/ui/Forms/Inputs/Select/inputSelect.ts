export type ObjectOption = object
export type Option = number | string | ObjectOption
export type Options = Option[]
export type Key = string | number
export type ModelValueSingle = number | string | Option | null | undefined
export type ModelValueMultiple = string[] | number[] | Option[]
export type ModelValue = ModelValueSingle | ModelValueMultiple
export type TextGetter = (option: Option) => string
export type IconGetter = (option: Option) => any
export type KeyGetter = (option: Option) => Key
export type ObjectTextGetter = (option: ObjectOption) => string
export type ObjectKeyGetter = (option: ObjectOption) => Key
export type OptionBooleanGetter = (option: Option) => boolean
export type ModelValueGetter = (option: ModelValueSingle) => ModelValueSingle

export interface NatInputSelectExpose {
  reset(): void
  openDropdown(): void
  focus(): void
}

export interface FetchOptions {
  page: number
  limit: number
  offset: number
  query: string
}

export type SelectFetch<T> = (options: FetchOptions) => Promise<T[]> | T[] | undefined

export interface OptionDisplay {
  key: Key
  text: Text
}

export interface OptionGroupDisplay {
  key: Key
  text: Text
  values: OptionDisplay[]
}

export interface SelectedIndices {
  groupIndex?: number
  optionIndex?: number
}
