<script setup lang="ts">
  import { isArray, isString } from '@/utils/typecheck'
  import { upload, UploadItem, UploadParams } from '@/utils/upload'
  import { removeElementFromArray } from '@/utils/utils'

  import { NatUploaderExpose, UnaccaptableFileReason, UploadedResponse, UploadError, BeforeUploadFn } from './uploader'

  interface Props {
    url?: string
    multiple?: boolean
    /**
     * can be comma separated list of Mime types and (or) file extentions like:
     * ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
     * or one of the following media type shortcuts: "audio/*", "video/*" or "image/*"
     */
    accept?: string | string[]
    params?: UploadParams
    disabled?: boolean
    maxSize?: number
    beforeUpload?: BeforeUploadFn
  }

  const props = defineProps<Props>()

  interface UploadQueueItem extends UploadItem {
    title: string
    error?: UploadError
  }

  interface Emits {
    (e: 'uploaded', uploaded: UploadedResponse[]): void
    (e: 'beforeUpload', file: File): void
  }

  const emit = defineEmits<Emits>()

  const acceptString = computed(() => isArray(props.accept) ? props.accept.join(',') || undefined : props.accept)
  const acceptArray = computed(() => {
    return isArray(props.accept)
      ? props.accept
      : props.accept
        ? props.accept.split(',')
        : []
  })

  const uploadSuccess = ref<boolean>()
  const uploadQueue = ref<UploadQueueItem[]>([])

  const isUploading = computed(() => uploadQueue.value.length !== 0)

  const addFile = (file: File, error?: UploadError) => {
    uploadQueue.value.push({
      title: file.name,
      progress: 0,
      done: false,
      error,
      file
    })
  }

  const input = ref<HTMLInputElement>()

  const startUpload = () => {
    if (uploadQueue.value.length === 0) return
    const allowed = uploadQueue.value.filter((item) => !item.error)
    if (allowed.length === 0) return
    return Promise.all(allowed.map((item) => {
      return Promise.resolve(props.beforeUpload?.(item.file)).then((newFile) => {
        let url = props.url
        if (newFile) {
          if (newFile instanceof File) {
            item.file = newFile
          } else if (isString(newFile)) {
            url = newFile
          } else if (newFile) {
            item.file = newFile.file
            url = newFile.url
          }
        }
        emit('beforeUpload', item.file)
        if (!url) return
        return upload(url, item, props.params).catch((err) => {
          if (err.status === 413 && props.maxSize) {
            item.error = UploadError.MaxSizeExceeded
          } else {
            item.error = UploadError.UnknownError
          }
        })
      })
    })).then((resArr) => {
      const uploaded: UploadedResponse[] = []
      allowed.forEach((item, index) => {
        if (item.done) uploaded.push({ file: item.file, data: resArr[index] })
      })
      uploadSuccess.value = uploaded.length > 0
      if (uploadSuccess.value) emit('uploaded', uploaded)
    })
  }

  const isFileAcceptable = (file: File | DataTransferItem): boolean => {
    if (acceptArray.value.length === 0) return true
    return acceptArray.value.some((accept) => {
      if (accept.endsWith('/*')) return file.type.startsWith(accept.slice(0, -1))
      if (accept.startsWith('.') && 'name' in file) return file.name.endsWith(accept)
      return file.type === accept
    })
  }

  const initQueue = (files: FileList | null) => {
    if (!files || !files[0]) return
    if (!props.multiple) uploadQueue.value = []

    Array.from(files).forEach((file) => {
      if (!isFileAcceptable(file)) {
        return addFile(file, UploadError.WrongFormat)
      }
      if (props.maxSize && file.size > props.maxSize) {
        return addFile(file, UploadError.MaxSizeExceeded)
      }

      addFile(file)
    })

    input.value?.form?.reset()
    startUpload()
  }

  const remove = (item: UploadQueueItem) => {
    removeElementFromArray(uploadQueue.value, item)
  }

  const reset = () => {
    uploadSuccess.value = undefined
    uploadQueue.value = []
    input.value?.form?.reset()
  }

  defineExpose<NatUploaderExpose>({ reset })

  type FileAcceptability = {
    isAcceptable: true
  } | {
    isAcceptable: false
    reason: UnaccaptableFileReason
  }

  const isAcceptableDrop = (e: DragEvent): FileAcceptability => {
    if (!e.dataTransfer) return { isAcceptable: false, reason: UnaccaptableFileReason.NoFiles }
    const files: (File | DataTransferItem)[] = e.type === 'drop'
      ? Array.from(e.dataTransfer.files)
      : Array.from(e.dataTransfer.items).filter((item) => item.kind === 'file')
    if (files.length === 0) return { isAcceptable: false, reason: UnaccaptableFileReason.NoFiles }
    if (!props.multiple && files.length > 1) return { isAcceptable: false, reason: UnaccaptableFileReason.SingleFileOnly }
    if (props.accept) {
      return files.every(isFileAcceptable)
        ? { isAcceptable: true }
        : { isAcceptable: false, reason: UnaccaptableFileReason.WrongFormat }
    }
    return { isAcceptable: true }
  }

  let leaveTimeout: number | undefined

  const isDragAcceptable = ref<boolean>()
  const dragRejectReason = ref<UnaccaptableFileReason>()

  const mainClasses = computed(() => [
    isDragAcceptable.value === true
      ? 'bg-substrate border-1 border-primary'
      : isDragAcceptable.value === false
        ? 'bg-danger bg-opacity-10 border-1 border-danger'
        : 'bg-substrate',
    { 'cursor-no-drop bg-tertiary border-substrate': props.disabled }
  ])

  const queueItemClass = (item: UploadQueueItem) => [
    item.error ? 'bg-danger bg-opacity-10' : 'bg-substrate',
    { 'border-1 border-danger': item.error }
  ]

  const onDragOver = (e: DragEvent) => {
    if (props.disabled) return
    e.preventDefault()
    e.stopPropagation()
    const acceptable = isAcceptableDrop(e)
    isDragAcceptable.value = acceptable.isAcceptable
    if (acceptable.isAcceptable) {
      dragRejectReason.value = undefined
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    } else {
      dragRejectReason.value = acceptable.reason
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none'
    }
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy'
    if (leaveTimeout) clearTimeout(leaveTimeout)
  }

  const onDragLeave = (e: DragEvent) => {
    if (props.disabled) return
    e.preventDefault()
    e.stopPropagation()
    leaveTimeout = window.setTimeout(() => {
      isDragAcceptable.value = undefined
    }, 100)
  }

  const onDrop = (e: DragEvent) => {
    if (!e.dataTransfer) return
    if (props.disabled) return
    e.preventDefault()
    e.stopPropagation()
    isDragAcceptable.value = undefined
    if (isAcceptableDrop(e).isAcceptable) {
      initQueue(e.dataTransfer.files)
    }
  }
</script>

<template>
  <form class="flex flex-col">
    <label
      v-if="!disabled"
      v-show="!isUploading"
      class="block flex-auto rounded-5px p-4 flex items-center justify-center cursor-pointer"
      :class="mainClasses"
      @dragover="onDragOver"
      @dragenter="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <template v-if="disabled">
        <IconUilBan />
      </template>
      <template v-else>
        <div v-if="isDragAcceptable === false">
          <slot
            name="reject"
            :reason="dragRejectReason"
          >
            <IconUilBan class="inline-block" /> {{ dragRejectReason }}
          </slot>
        </div>
        <div v-else-if="isDragAcceptable == null">
          <slot>
            <IconUilPaperclip class="inline-block" />
          </slot>
        </div>
        <input
          ref="input"
          type="file"
          :accept="acceptString"
          :multiple="multiple"
          hidden
          :disabled="disabled"
          @change="initQueue((($event as InputEvent).target! as HTMLInputElement).files)"
        >
      </template>
    </label>
    <div
      v-if="uploadQueue.length"
      class="flex flex-col gap-2 mb-4"
    >
      <div
        v-for="(item, index) in uploadQueue"
        :key="index"
        class="p-2 rounded-5px"
        :class="queueItemClass(item)"
      >
        <div class="mb-1 flex items-center gap-1">
          {{ item.title }}
          <NatButton
            v-if="item.error"
            semantics="link"
            rounded
            :padding="false"
            class="inline-block p-0.5 -m-0.5"
            @click="remove(item)"
          >
            <IconEvaCloseFill />
          </NatButton>
          <IconUilCheck
            v-else
            class="inline-block"
          />
        </div>
        <div>
          <div
            v-if="item.error"
            class="text-danger"
          >
            <slot
              name="error"
              :error="item.error"
            >
              {{ item.error }}
            </slot>
          </div>
          <template v-else>
            <NatProgressBar :modelValue="item.progress" />
          </template>
        </div>
      </div>
    </div>

    <div v-show="uploadSuccess === true">
      <slot
        name="ok"
        :ok="reset"
      >
        <NatButton
          class="w-full"
          semantics="accent"
          label="Ok"
          @click="reset()"
        />
      </slot>
    </div>

    <div v-show="uploadSuccess === false && uploadQueue.length > 0">
      <slot
        name="repeat"
        :ok="reset"
      >
        <NatButton
          class="w-full"
          semantics="primary"
          @click="reset()"
        >
          <IconUilRefresh />
        </NatButton>
      </slot>
    </div>
  </form>
</template>
