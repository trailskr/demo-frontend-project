import { Editor } from '@tiptap/vue-3'
import { createMarkdownEditor, MarkdownEditor as MarkdownEditorType, MarkdownEditorOptions } from 'tiptap-markdown'

export const MarkdownEditor = createMarkdownEditor(Editor)
export type MarkdownEditor = MarkdownEditorType

export const useMarkdownEditor = (options?: Partial<MarkdownEditorOptions> | undefined) => {
  const editor = shallowRef<MarkdownEditor>()

  onMounted(() => {
    editor.value = new MarkdownEditor(options)
  })

  onBeforeUnmount(() => {
    if (editor.value != null) {
      editor.value.destroy()
      editor.value = undefined
    }
  })

  return editor
}
