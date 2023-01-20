import { isFunction, isObjectLike } from './typecheck'
import { QueryParameters, queryStringFromObject } from './utils'

const isLikeJSON = (text: string) => {
  return typeof text === 'string' && (text[0] === '[' || text[0] === '{')
}

export interface UploadItem {
  file: File
  done: boolean
  progress: number
}

export interface UploadParams {
  method?: string
  query?: QueryParameters
  headers?: Record<string, string>
  contentType?: string
  /**
   * additional form data, when using contentType === 'multipart/form-data'
   */
  formData?: Record<string, unknown>
}

export interface UploadResponse<T = unknown> {
  data: T
  status: XMLHttpRequest['status']
}

export const upload = <T>(url: string, item: UploadItem, params: UploadParams = {}) => new Promise<UploadResponse<T>>((resolve, reject) => {
  const { method = 'POST', query = {}, headers = {}, contentType = item.file.type ?? 'application/octet-stream', formData = {} } = params
  const xhr = new XMLHttpRequest()

  xhr.open(method || 'POST', url + queryStringFromObject(query), true)

  Object.entries(headers).forEach(([key, header]) => {
    xhr.setRequestHeader(key, header)
  })

  xhr.setRequestHeader('filename', encodeURIComponent(item.file.name))
  xhr.setRequestHeader('filesize', item.file.size.toString())
  xhr.setRequestHeader('mimetype', item.file.type)

  xhr.addEventListener('load', () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      return reject({
        data: xhr.response,
        status: xhr.status
      } as UploadResponse<T>)
    }

    item.done = true
    item.progress = 100

    resolve({
      data: isLikeJSON(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText,
      status: xhr.status
    })
  })

  xhr.upload.addEventListener('progress', (e) => {
    item.progress = Math.round(e.lengthComputable ? e.loaded * 100 / e.total : 0)
  })

  xhr.addEventListener('error', () => {
    reject({
      data: isLikeJSON(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText,
      status: xhr.status
    } as UploadResponse<T>)
  })

  xhr.setRequestHeader('Content-Type', contentType)

  if (contentType === 'multipart/form-data') {
    const form = new FormData()
    form.append('file', item.file, item.file.name)
    Object.entries(formData).forEach(([key, v]) => {
      if (isFunction(v)) v = v(item.file)
      if (v != null) form.append(key, isObjectLike(v) ? JSON.stringify(v) : (v as any).toString())
    })
    xhr.send(form)
  } else {
    xhr.send(item.file)
  }
})
