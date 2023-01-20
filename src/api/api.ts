import { createApi } from '@/utils/createApi'

export const api = createApi({
  baseUrl: import.meta.env.VITE_API_URL
})
