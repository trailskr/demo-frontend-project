// import { diff } from 'deep-diff'
import { Ref } from 'vue'

// import { get } from '@/utils/path'
import { isArray, isObject } from '@/utils/typecheck'
import { deepMerge, isEqual, deepClone, DeepCloneOptions } from '@/utils/utils'

// filter only defined arrays
const filter = (key: string | number, from: unknown, to:unknown) => {
  if (!isObject(to)) return true
  if (!isArray(to[key])) return true
  return isObject(from) && isArray(from[key])
}

// const useDebugChangesDiff = (
//   form: Ref<any>,
//   initialForm: Ref<any>,
//   cloneOptions?: DeepCloneOptions
// ) => {
//   // debug difference
//   const cloneFilter = cloneOptions?.filter
//   const prefilter = cloneFilter
//     ? (path: any[], key: any) => {
//         return !cloneFilter(key, get(form.value, path), get(initialForm.value, path))
//       }
//     : undefined
//   const diffData = computed(() => diff(form.value, initialForm.value, prefilter))

//   watch(diffData, (diffVal) => {
//     console.log('changes: ', diffVal)
//   }, { deep: true, immediate: true })
// }

export interface UseFormCloneResult<T> {
  form: Ref<T>
  isChanged: Readonly<Ref<boolean>>
}

export interface UseFormCloneSimpleParams<TSrc> {
  initialData: () => TSrc
  onDataUpdate?: (form: TSrc) => void
  cloneOptions?: DeepCloneOptions
}

export interface UseFormCloneConvertionParams<TSrc, TForm> {
  initialData: () => TForm
  onDataUpdate?: (form: TForm) => void
  formConverter: (form: TSrc) => TForm
  cloneOptions?: DeepCloneOptions
}

export type UseFormCloneParams<TSrc, TForm> = UseFormCloneConvertionParams<TSrc, TForm> | UseFormCloneSimpleParams<TSrc>

export const useFormClone: {
  <T extends object>(data: Readonly<Ref<T | undefined>>, params: UseFormCloneSimpleParams<T>): UseFormCloneResult<T>
  <TSrc extends object, TForm extends object = TSrc>(data: Readonly<Ref<TSrc | undefined>>, params: UseFormCloneConvertionParams<TSrc, TForm>): UseFormCloneResult<TForm>
} = <TSrc extends object, TForm extends object = TSrc>(data: Readonly<Ref<TSrc | undefined>>, params: UseFormCloneParams<TSrc, TForm>): UseFormCloneResult<TSrc> | UseFormCloneResult<TForm> => {
  const { cloneOptions } = params
  if ('formConverter' in params) {
    const { formConverter, onDataUpdate, initialData } = params
    const form = ref<TForm>(initialData()) as Ref<TForm>
    const initialForm = ref<TForm>()
    const isChanged = computed(() => !isEqual(form.value, initialForm.value, cloneOptions))

    // debug difference
    // useDebugChangesDiff(form, initialForm, cloneOptions)

    watch(data, (val) => {
      if (val) {
        form.value = formConverter(deepMerge(initialData(), toRaw(val), { filter }))
      }
      onDataUpdate?.(form.value)
      initialForm.value = deepClone(form.value, cloneOptions)
    }, { immediate: true })
    return { form, isChanged }
  } else {
    const { onDataUpdate, initialData } = params
    const form = ref<TSrc>(initialData()) as Ref<TSrc>
    const initialForm = ref<TSrc>()
    const isChanged = computed(() => !isEqual(form.value, initialForm.value, cloneOptions))

    // debug difference
    // useDebugChangesDiff(form, initialForm, cloneOptions)

    watch(data, (val) => {
      if (val) {
        form.value = deepMerge(initialData(), toRaw(val), { filter })
      }
      onDataUpdate?.(form.value)
      initialForm.value = deepClone(form.value, cloneOptions)
    }, { immediate: true })
    return { form, isChanged }
  }
}
