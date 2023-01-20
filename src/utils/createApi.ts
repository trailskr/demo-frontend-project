// import fetch from 'cross-fetch'

import { isArray, isNumber, isObjectLike, isString, isVoid } from './typecheck'

export type ResponseWithData<TRes = unknown> = Response & {data: TRes}
export type QueryParameter = string | number | boolean | null | undefined
export type QueryParameterOrArray = QueryParameter | QueryParameter[]
export type QueryParameters = Record<string, QueryParameterOrArray>

export const isResponseWithData = <TRes = unknown>(data: unknown): data is ResponseWithData<TRes> => {
  return isObjectLike(data) && 'status' in data && isNumber(data.status) && 'data' in data
}

export interface RequestOptions<TReq = unknown> {
  url: string
  data?: TReq
  query?: QueryParameters
  headers?: Record<string, string>
  signal?: AbortSignal
}

export type InterceptorRequestOptions<TReq = unknown> = RequestOptions<TReq> & { baseUrl: string, method: string }

export type RequestOptionsWithoutUrl<TReq = unknown> = Omit<RequestOptions<TReq>, 'url'>

export type CallerOptions = Pick<RequestOptions, 'headers' | 'signal'>

export type ApiCaller = {
  <TRes = unknown, TReq = unknown>(url: string, options?: RequestOptionsWithoutUrl<TReq>): Promise<ResponseWithData<TRes>>
  <TRes = unknown, TReq = unknown>(options: RequestOptions<TReq>): Promise<ResponseWithData<TRes>>
}

export type ApiRequestInterceptor<TReq = unknown> = (options: InterceptorRequestOptions<TReq>) => InterceptorRequestOptions<TReq> | Promise<InterceptorRequestOptions<TReq>> | Response | Promise<Response>
export type ApiResponseInterceptor<TResInp = unknown, TResOut = TResInp> = (response: ResponseWithData<TResInp>) => ResponseWithData<TResOut> | Promise<ResponseWithData<TResOut>>

export interface Api {
  get: ApiCaller
  post: ApiCaller
  put: ApiCaller
  delete: ApiCaller

  addRequestInterceptor: (interceptor: ApiRequestInterceptor) => void
  addResponseInterceptor: (interceptor: ApiResponseInterceptor) => void
}

export interface ApiOptions {
  baseUrl: string
  requestInterceptors?: ApiRequestInterceptor[]
  responseInterceptors?: ApiResponseInterceptor[]
}

const textContentType = 'text/'
const jsonContentType = 'application/json'

const addDataResponse = <TRes>(res: Response, data: TRes) => {
  const resWithData = res as ResponseWithData<TRes>
  resWithData.data = data
  return resWithData
}

export const handleError = <TRes = unknown>(res: Response) => {
  if (res.ok) return res
  const contentType = res.headers.get('Content-Type')
  if (!contentType) return Promise.reject(res as ResponseWithData<TRes>)
  if (contentType.includes(jsonContentType)) {
    return res.json().then((data) => Promise.reject(addDataResponse(res, data)))
  } else {
    return res.text().then((text) => Promise.reject(addDataResponse(res, text)))
  }
}

export const addResponseData = <TRes = unknown>(res: Response): ResponseWithData<TRes> | Promise<ResponseWithData<TRes>> => {
  const contentType = res.headers.get('Content-Type')
  if (!contentType) return res as ResponseWithData<TRes>
  if (contentType.includes(jsonContentType)) {
    return res.json().then((data: TRes) => addDataResponse(res, data))
  } else {
    return res.text().then((text) => addDataResponse(res, text as unknown as TRes))
  }
}

const queryToString = (query?: Record<string, QueryParameterOrArray>): string => {
  if (!query) return ''
  const result = Object.keys(query)
    .filter((key) => query[key] != null)
    .map((key) => {
      const parameter = query[key]
      const parameterArray = isArray(parameter) ? parameter : [parameter]
      return parameterArray.map((param) => `${key}=${param}`).join('&')
    }).join('&')
  return result && '?' + result
}

export const makeCaller = (baseUrl: string, method: string): ApiCaller => <TRes = unknown, TReq = unknown>(urlOrOptions: string | RequestOptions<TReq>, mayBeOptions?: RequestOptionsWithoutUrl<TReq>): Promise<ResponseWithData<TRes>> => {
  const options: RequestOptions<TReq> = isString(urlOrOptions) ? { url: urlOrOptions, ...mayBeOptions } : urlOrOptions
  const { url, data, query, signal } = options

  const [body, contentType] = isString(data)
    ? [data, textContentType]
    : isVoid(data)
      ? [undefined, undefined]
      : [JSON.stringify(data), jsonContentType]

  const headers: Record<string, string> = {
    Accept: jsonContentType,
    ...options.headers
  }

  if (contentType) headers['Content-Type'] = contentType

  return fetch(baseUrl + url + queryToString(query), {
    mode: 'cors',
    method,
    body,
    headers,
    signal
  })
    .then(handleError)
    .then((res) => addResponseData<TRes>(res))
}

const processRequestInterceptors = <TReq>(
  requestInterceptors: ApiRequestInterceptor<TReq>[],
  optionsOrResponsePromise: Promise<InterceptorRequestOptions<TReq> | Response>,
  interceptorIndex = 0
): Promise<Response | InterceptorRequestOptions<TReq>> => {
  if (interceptorIndex === requestInterceptors.length) return optionsOrResponsePromise
  return optionsOrResponsePromise.then((optionsOrResponse) => {
    if (optionsOrResponse instanceof Response) return optionsOrResponse
    const interceptor = requestInterceptors[interceptorIndex]
    const interceptedOptionsOrResponsePromise = Promise.resolve(interceptor(optionsOrResponse))
    return processRequestInterceptors(requestInterceptors, interceptedOptionsOrResponsePromise, interceptorIndex + 1)
  })
}

const makeCallerWithInterceptors = (baseUrl: string, method: string, requestInterceptors: ApiRequestInterceptor[], responseInterceptors: ApiResponseInterceptor[]): ApiCaller => {
  const caller = makeCaller(baseUrl, method)

  return <TRes = unknown, TReq = unknown>(urlOrOptions: string | RequestOptions<TReq>, mayBeOptions?: RequestOptionsWithoutUrl<TReq>): Promise<ResponseWithData<TRes>> => {
    const options: RequestOptions<TReq> = isString(urlOrOptions) ? { url: urlOrOptions, ...mayBeOptions } : urlOrOptions
    const interceptorOptions: InterceptorRequestOptions<TReq> = { ...options, baseUrl, method }

    const interceptedOptionsOrResponse = processRequestInterceptors(requestInterceptors as ApiRequestInterceptor<TReq>[], Promise.resolve(interceptorOptions))

    const response = interceptedOptionsOrResponse.then((nextInterceptedOptionsOrResponse) => {
      return nextInterceptedOptionsOrResponse instanceof Response
        ? addResponseData<TRes>(nextInterceptedOptionsOrResponse)
        : caller<TRes, TReq>(nextInterceptedOptionsOrResponse)
    })

    return response.then((nextResponse) => (responseInterceptors as ApiResponseInterceptor<TRes>[]).reduce((responsePromise, interceptor) => {
      return responsePromise.then((res) => Promise.resolve(interceptor(res)))
    }, Promise.resolve(nextResponse)))
  }
}

export const createApi = (options: ApiOptions): Api => {
  const { baseUrl = '/', requestInterceptors = [], responseInterceptors = [] } = options
  return {
    get: makeCallerWithInterceptors(baseUrl, 'GET', requestInterceptors, responseInterceptors),
    post: makeCallerWithInterceptors(baseUrl, 'POST', requestInterceptors, responseInterceptors),
    put: makeCallerWithInterceptors(baseUrl, 'PUT', requestInterceptors, responseInterceptors),
    delete: makeCallerWithInterceptors(baseUrl, 'DELETE', requestInterceptors, responseInterceptors),

    addRequestInterceptor: (interceptor: ApiRequestInterceptor) => {
      requestInterceptors.push(interceptor)
    },
    addResponseInterceptor: (interceptor: ApiResponseInterceptor) => {
      responseInterceptors.push(interceptor)
    }
  }
}
