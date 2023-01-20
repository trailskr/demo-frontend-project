import { Pager, PagerConf } from '@/ui/Pagination/Pager'

export interface UsePagerParams {
  useRouteQueryParam?: boolean
}

export const usePager = (conf: PagerConf, { useRouteQueryParam = true }: UsePagerParams = {}) => {
  const pg = reactive(new Pager(conf))
  if (useRouteQueryParam) {
    const page = useRouteQuery('page')
    const routePage = Number(page.value)
    if (routePage > 0) pg.update({ page: routePage })
    watch(() => pg.page, (p) => {
      page.value = p === 1 ? null : p.toString()
    })
  }
  return pg
}
