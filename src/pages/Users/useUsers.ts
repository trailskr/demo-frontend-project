import { UnwrapNestedRefs } from 'vue'

import {
  createUser,
  deleteUser,
  getUsers,
  GetUsersParameters,
  getUser,
  GetUserParameters,
  updateUser
} from '@/api/apiCalls'
import { UserInfo } from '@/api/apiTypes'
import { ResponsiveColumnWithPath } from '@/components/Grid/ResponsiveGrid/responsiveGrid'
import UserBadge from '@/components/UserBadge.vue'
import { Pager } from '@/ui/Pagination/Pager'
import { UseActionMutationOptions, useActionMutation } from '@/use/useActionMutation'
import { UseEditMutationOptions, useEditMutation } from '@/use/useEditMutation'
import { IsoOptionalQueryFnParams, useIsoOptionalQuery, UseIsoOptionalQueryOptions } from '@/use/useIsoOptionalQuery'
import { PaginatedIsoQueryFnParams, useIsoPaginatedQuery, UseIsoPaginatedQueryOptions } from '@/use/useIsoPaginatedQuery'
import { useIsoQueryParams } from '@/use/useIsoQueryParams'
import { combineName, getInitials } from '@/utils/name'
import { identity } from '@/utils/utils'

import UsersActions from './UsersActions.vue'

export const useUsersColumns = (actionsProps: Record<string, any>): ResponsiveColumnWithPath[] => {
  const { t } = useI18n()

  return [
    {
      key: 'name',
      cellClass: 'font-semibold text-main',
      path: '',
      name: t('name'),
      isSortable: true,
      showInSmall: true,
      component: UserBadge
    },
    {
      key: 'email',
      path: 'email',
      name: t('email'),
      isSortable: true,
      showInSmall: true
    },
    {
      key: 'phone',
      path: 'phone',
      name: t('phone'),
      isSortable: true,
      showInSmall: true
    },
    {
      key: 'actions',
      path: '',
      name: t('actions'),
      isSortable: false,
      showInSmall: true,
      bigCellClass: 'w-28',
      component: UsersActions,
      componentProps: actionsProps
    }
  ]
}

export const UsersKey = 'users'
export const userKey = 'user'

const usersDataResponseKey = 'users'
export const useUsersQuery = (params: PaginatedIsoQueryFnParams<GetUsersParameters>, pg?: UnwrapNestedRefs<Pager>, options?: UseIsoPaginatedQueryOptions<UserInfo, typeof usersDataResponseKey>) => {
  const modifiedParams = useIsoQueryParams(params, { query: { useDebounce: true } })
  return useIsoPaginatedQuery(UsersKey, usersDataResponseKey, getUsers, modifiedParams, pg, options)
}

export const useUserQuery = (params: IsoOptionalQueryFnParams<GetUserParameters>, user?: UserInfo, options?: UseIsoOptionalQueryOptions<UserInfo>) => {
  return useIsoOptionalQuery([userKey, params.id], getUser, params, user, { ...options, enabled: computed(() => unref(params.id) !== 0) })
}

export const useUserEditMutation = (options?: UseEditMutationOptions<UserInfo, UserInfo>) => {
  return useEditMutation(UsersKey, (user) => [userKey, user.id], {
    update: (params, form) => updateUser(params, form),
    create: (form) => createUser(form)
  }, options)
}

export const useUserDeleteMutation = (options?: UseActionMutationOptions) => {
  return useActionMutation(UsersKey, deleteUser, options)
}

export const getPersonFullName = ({ firstName, lastName }: { firstName: string | null, lastName: string }): string => combineName(firstName, lastName)
export const getPersonInitials = ({ firstName, lastName }: { firstName: string, lastName: string }): string => getInitials(firstName, lastName)
export const getPersonFullNameWithTitle = (userData: { firstName: string, lastName: string, title?: string | null }): string => {
  return [getPersonFullName(userData), userData.title].filter(identity).join(', ')
}
