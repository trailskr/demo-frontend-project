<script setup lang="ts">
  import { EditorContent } from '@tiptap/vue-3'

  import { useMarkdownEditor } from './MarkdownEditor'
  import { extensions } from './editorExtensions'

  interface Props {
    modelValue?: string | null
  }

  const props = defineProps<Props>()

  const editor = useMarkdownEditor({
    content: props.modelValue,
    editable: false,
    extensions
  })
</script>

<template>
  <EditorContent
    class="prose max-w-none -my-0.5em"
    :editor="editor"
  />
</template>
