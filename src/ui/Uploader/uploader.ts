export interface UploadedResponse<T = unknown> {
  file: File
  data: T
}

export enum UnaccaptableFileReason {
  NoFiles = 'no-files',
  SingleFileOnly = 'single-file-only',
  WrongFormat = 'wrong-format'
}

export enum UploadError {
  MaxSizeExceeded = 'max-size-exceeded',
  UnknownError = 'unknown-error',
  WrongFormat = 'wrong-format',
}

export interface NatUploaderExpose {
  reset: () => void
}

export interface FileWithUrl {
  file: File
  url: string
}

export type UploadUrl = string

export type BeforeUploadResult = void | File | UploadUrl | FileWithUrl
export type BeforeUploadResultMaybePromise = BeforeUploadResult | Promise<BeforeUploadResult>
export type BeforeUploadFn = (file: File) => BeforeUploadResultMaybePromise
