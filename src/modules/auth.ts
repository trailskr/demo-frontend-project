import jwtDecode, { JwtPayload } from 'jwt-decode'

import type { UserModule } from '@/UserModule'
import { api } from '@/api/api'
import { getUser, login } from '@/api/apiCalls'
import { AuthCredentials, UserInfo } from '@/api/apiTypes'

export interface JwtUserPayload extends JwtPayload {
  id: number
  username: string
}

export const accessToken = useLocalStorage<string>('accessToken', '')
export const accessTokenJWT = ref<JwtUserPayload>()
watch(accessToken, (token) => {
  accessTokenJWT.value = token ? jwtDecode<JwtUserPayload>(token) : undefined
}, { immediate: true })
// @ts-ignore
window.accessTokenJWT = accessTokenJWT

export const refreshToken = useLocalStorage<string>('refreshToken', '')
export const refreshTokenJWT = ref<JwtUserPayload>()
watch(refreshToken, (token) => {
  refreshTokenJWT.value = token ? jwtDecode<JwtUserPayload>(token) : undefined
}, { immediate: true })
// @ts-ignore
window.refreshTokenJWT = refreshTokenJWT

const logToken = (token: JwtUserPayload, label: string) => {
  console.log(`${label}, expires:`, new Date(token.exp! * 1000).toString(), 'username:', token.username)
}

watch(accessTokenJWT, (token) => {
  if (!token) return
  logToken(token, 'accessToken')
}, { immediate: true })

watch(refreshTokenJWT, (token) => {
  if (!token) return
  logToken(token, 'refreshToken')
}, { immediate: true })

const fiveMins = 5 * 60
const isTokenExpired = (token: JwtPayload | undefined) => {
  if (!token || !token.exp) return true
  return Date.now() / 1000 + fiveMins > token.exp
}

export const useSignOut = () => {
  const router = useRouter()

  return () => {
    accessToken.value = ''
    refreshToken.value = ''
    router.push({ name: 'Auth' })
  }
}

export const user = ref<UserInfo>()

const currentUserId = accessTokenJWT.value?.id
if (currentUserId) {
  getUser({ id: currentUserId }).then((userInfo) => {
    user.value = userInfo
  })
}

const returnFullPath = useLocalStorage('authReturnPath', '')

export const useSignIn = () => {
  const router = useRouter()

  return (data: AuthCredentials) => {
    return login(data).then((authUserInfo) => {
      user.value = authUserInfo
      accessToken.value = authUserInfo.token
      refreshToken.value = ''
      router.push(returnFullPath.value)
    })
  }
}

// NOT IMPLEMENTED IN API
const doRefreshToken = (_params: { refreshToken: string }) => Promise.resolve({
  accessToken: accessToken.value,
  refreshToken: refreshToken.value
})

const refreshTokens = () => {
  console.log('refreshing tokens with:')
  logToken(refreshTokenJWT.value!, 'refreshToken')
  return doRefreshToken({ refreshToken: refreshToken.value }).then((data) => {
    console.log('tokens refreshed')
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
  })
}

let refreshPromise: Promise<void> | undefined

export const install: UserModule = ({ router }) => {
  router.beforeEach((to, from, next) => {
    const useAuth = to.matched.some((m) => m.meta.useAuth)
    if (!useAuth) return next()
    if (isTokenExpired(accessTokenJWT.value)) {
      if (isTokenExpired(refreshTokenJWT.value)) {
        returnFullPath.value = to.fullPath
        return next({ name: 'Auth' })
      }
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = undefined
        })
      }
      return refreshPromise.then(() => {
        next()
      }).catch((err) => {
        console.error(err)
        returnFullPath.value = to.fullPath
        next({ name: 'Auth' })
      })
    }
    next()
  })

  api.addRequestInterceptor((req) => {
    if (req.url.startsWith('/auth')) return req
    if (isTokenExpired(accessTokenJWT.value)) {
      if (isTokenExpired(refreshTokenJWT.value)) {
        router.push({ name: 'Auth' })
        return req
      }
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = undefined
        })
      }
      return refreshPromise.then(() => {
        req.headers = {
          ...req.headers,
          Authorization: `Bearer ${accessToken.value}`
        }
        return req
      }).catch((err) => {
        console.error(err)
        router.push({ name: 'Auth' })
        throw err
      })
    }
    req.headers = {
      ...req.headers,
      Authorization: `Bearer ${accessToken.value}`
    }
    return req
  })

  api.addResponseInterceptor((res) => {
    if (res.status === 401) {
      router.push({ name: 'Auth' })
    }
    return res
  })
}
