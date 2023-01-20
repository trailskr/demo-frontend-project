import { Component } from 'vue'

import { compilePath, get, Path, set } from '@/utils/path'
import { isArray, isString } from '@/utils/typecheck'

export type DataGridRowKey = string | number
// eslint-disable-next-line @typescript-eslint/ban-types
export type DataGridRow = any
export type DataGridRowGetter<T extends DataGridRow = DataGridRow, Key extends keyof T = keyof T> = (row: T) => T[Key]
export type DataGridRowKeyGetter<T extends DataGridRow = DataGridRow> = (row: T) => DataGridRowKey
export type DataGridRowSetter<T extends DataGridRow = DataGridRow, Key extends keyof T = keyof T> = (row: T, value: T[Key]) => void

export interface ColumnBase {
  key: string
  name?: string
  cellClass?: string
  bigCellClass?: string
  // if component is present is will recieve column value through column prop
  headerComponent?: string | Component
  headerComponentProps?: Record<string, any>
  // if component is present is will sync row value through v-model using getter and setter
  // and column to column prop
  // eslint-disable-next-line @typescript-eslint/ban-types
  component?: string | Component
  componentProps?: Record<string, any>
  isSortable?: boolean
  isVisible?: boolean
  hideInXSmall?: boolean
}

export interface ColumnWithPath extends ColumnBase {
  path: string | Path
}

export const isColumnWithPath = (columnDef: ColumnWithPath | ColumnBase): columnDef is ColumnWithPath => {
  return 'path' in columnDef
}

export interface Column<T extends DataGridRow = DataGridRow, Key extends keyof T = keyof T> extends ColumnBase {
  getter: DataGridRowGetter<T, Key>
  setter?: DataGridRowSetter<T, Key>
}

export type ColumnDef<T extends DataGridRow = DataGridRow, Key extends keyof T = keyof T> = ColumnWithPath | Column<T, Key>

export const mapToColumn = <T extends DataGridRow = DataGridRow, Key extends keyof T = keyof T>(columnDef: ColumnWithPath | Column<T, Key>): Column<T, Key> => {
  if (isColumnWithPath(columnDef)) {
    const { path, ...rest } = columnDef
    const compiledPath = isArray(path) ? path : compilePath(path)
    return {
      ...rest,
      getter: (row: T) => get(row, compiledPath) as T[Key],
      setter: (row: T, value: T[Key]) => { set(row, compiledPath, value) }
    }
  }
  return columnDef
}

export const makeRowKeyGetter = <T extends DataGridRow = DataGridRow>(pathOrRowKeyGetter: string | DataGridRowKeyGetter<T>): DataGridRowKeyGetter<T> => {
  if (isString(pathOrRowKeyGetter)) {
    const compiledPath = compilePath(pathOrRowKeyGetter)
    return (row: T) => get(row, compiledPath) as DataGridRowKey
  }
  return pathOrRowKeyGetter
}
