/**
 * file is autogenerated by utils/generateApi.ts, do not edit
 */

import { CallerOptions, ResponseWithData } from '@/utils/createApi'

import { api } from './api'
import { AuthUserInfo, UserInfo, AuthCredentials, UsersPagedList, UserForm } from './apiTypes'

const getData = <T>(res: ResponseWithData<T>): T => res.data

export const login = (data: AuthCredentials, options?: CallerOptions): Promise<AuthUserInfo> => {
  return api.post<AuthUserInfo, AuthCredentials>('/auth/login', { data, ...options }).then(getData)
}

export interface GetUsersParameters {
  query?: string | null
  limit?: number | null
  skip?: number | null
  desc?: boolean | null
  sort?: 'name' | 'email' | 'phone' | null
}
export const getUsers = (params: GetUsersParameters, options?: CallerOptions): Promise<UsersPagedList> => {
  const { query, limit, skip, desc, sort } = params
  return api.get<UsersPagedList>('/users', { query: { query, limit, skip, desc, sort }, ...options }).then(getData)
}

export const createUser = (data: UserForm, options?: CallerOptions): Promise<UserInfo> => {
  return api.post<UserInfo, UserForm>('/users', { data, ...options }).then(getData)
}

export interface DeleteUserParameters {
  id: number
}
export const deleteUser = (params: DeleteUserParameters, options?: CallerOptions): Promise<void> => {
  const { id } = params
  return api.delete<void>(`/users/${id}`, { ...options }).then(getData)
}

export interface GetUserParameters {
  id: number
}
export const getUser = (params: GetUserParameters, options?: CallerOptions): Promise<UserInfo> => {
  const { id } = params
  return api.get<UserInfo>(`/users/${id}`, { ...options }).then(getData)
}

export interface UpdateUserParameters {
  id: number
}
export const updateUser = (params: UpdateUserParameters, data: UserForm, options?: CallerOptions): Promise<UserInfo> => {
  const { id } = params
  return api.put<UserInfo, UserForm>(`/users/${id}`, { data, ...options }).then(getData)
}