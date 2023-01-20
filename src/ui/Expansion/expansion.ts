import { createParentChild } from '@/use/useParentChild'

let expansionId = 0
export const getExpansionId = () => expansionId++

export interface Expansion {
  id: number
  close: () => void
}

export interface ExpansionGroup {
  onOpen: (expansion: Expansion) => void
}

const { useParent: useExpansionGroup, useChild: useExpansion } = createParentChild<Expansion, ExpansionGroup>('expansionGroupKey')
export { useExpansionGroup, useExpansion }

export type Semantics = 'default' | 'emphasis'
