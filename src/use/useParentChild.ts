import { InjectionKey, Ref, UnwrapRef } from 'vue'

import { removeElementFromArray } from '@/utils/utils'

export interface AbstractParent<Child> {
  addChild: (child: UnwrapRef<Child>) => void
  removeChild: (child: UnwrapRef<Child>) => void
}

export type ParentType<Child, ParentMethods> = AbstractParent<Child> & ParentMethods

export interface ParentChildReturn<Child, ParentMethods> {
    useParent: (parentMethods?: ParentMethods) => Ref<UnwrapRef<Child>[]>
    useChild: (child: UnwrapRef<Child>) => ParentType<Child, ParentMethods> | undefined
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const createParentChild = <
  Child extends object | undefined = undefined,
  ParentMethods extends object | undefined = undefined
>(description: string): ParentChildReturn<Child, ParentMethods> => {
  const parentKey: InjectionKey<ParentType<Child, ParentMethods>> = Symbol(description)

  const useParent = (parentMethods?: ParentMethods): Ref<UnwrapRef<Child>[]> => {
    const children = ref<Child[]>([])

    const parent = {
      addChild: (child: UnwrapRef<Child>) => {
        children.value.push(child as any)
      },
      removeChild: (child: UnwrapRef<Child>) => {
        removeElementFromArray(children.value, child as any)
      },
      ...parentMethods
    }

    provide(parentKey, parent)

    return children as Ref<UnwrapRef<Child>[]>
  }

  const useChild = (child: UnwrapRef<Child>): ParentType<Child, ParentMethods> | undefined => {
    const parent = inject(parentKey, undefined)

    if (parent) {
      parent.addChild(child)

      onBeforeUnmount(() => {
        parent.removeChild(child)
      })
    }

    return parent
  }

  return {
    useParent,
    useChild
  }
}
