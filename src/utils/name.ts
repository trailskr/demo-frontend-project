import { identity } from '@/utils/utils'

export const getInitials = (firstName: string | undefined | null, lastName: string | undefined | null, middleName?: string | null): string => {
  return [firstName?.[0], middleName?.[0], lastName?.[0]].filter(identity).join(' ')
}

export const combineName = (firstName: string | undefined | null, lastName: string | undefined | null, middleName?: string | null): string => {
  return [firstName, middleName, lastName].filter(identity).join(' ')
}
