<script setup lang="ts">
  import { EditorContent } from '@tiptap/vue-3'

  import { useMarkdownEditor } from './MarkdownEditor'
  import { extensions } from './editorExtensions'

  interface Props {
    modelValue?: string | null
    editorClass?: string
    disabled?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  const editor = useMarkdownEditor({
    content: props.modelValue,
    onUpdate: ({ editor: ed }) => {
      emit('update:modelValue', ed.getMarkdown())
    },
    extensions
  })

  watch(() => props.disabled, (isDisabled) => {
    editor.value?.setEditable(!isDisabled)
  }, { immediate: true })

  const showLinkEditPrompt = ref(false)
  const linkHref = ref('')
  const toggleLink = () => {
    if (!editor.value) return
    linkHref.value = editor.value.isActive('link')
      ? editor.value.getAttributes('link').href
      : ''
    showLinkEditPrompt.value = true
  }

  const setLinkUrl = () => {
    if (!editor.value) return
    showLinkEditPrompt.value = false
    const href = linkHref.value
    linkHref.value = ''
    if (!href) {
      if (editor.value.isActive('link')) {
        editor.value.chain().focus().unsetLink().run()
      }
    }
    editor.value.chain().focus().toggleLink({ href, target: '_blank' }).run()
  }
</script>

<template>
  <div>
    <div
      v-if="editor"
      class="flex items-center px-2 pt-2 mb-2"
    >
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('bold')"
        :tooltipText="t('rich-text.bold')"
        :keysPc="['Control', 'B']"
        :keysMac="['Cmd', 'B']"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <IconIcBaselineFormatBold />
      </NatInputRichTextButton>
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('italic')"
        :tooltipText="t('rich-text.italic')"
        :keysPc="['Control', 'I']"
        :keysMac="['Cmd', 'I']"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <IconIcBaselineFormatItalic />
      </NatInputRichTextButton>
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('strike')"
        :tooltipText="t('rich-text.strikethrough')"
        :keysPc="['Control', 'Shift', 'I']"
        :keysMac="['Cmd', 'Shift', 'I']"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <IconIcBaselineStrikethroughS />
      </NatInputRichTextButton>
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('link')"
        :tooltipText="t('rich-text.link')"
        @click="toggleLink()"
      >
        <IconIcBaselineLink />
      </NatInputRichTextButton>
      <NatDialog
        v-slot="{ close }"
        v-model="showLinkEditPrompt"
      >
        <div class="overflow-auto max-h-90vh rounded-5px bg-white m-8">
          <NatForm
            class="sm:min-w-132 p-5"
            @submit="setLinkUrl()"
          >
            <NatText
              v-model="linkHref"
              label="URL"
            >
              <template #right>
                <IconEvaCloseFill
                  class="font-medium"
                  width="1.5em"
                  height="1.5em"
                  role="button"
                  :title="t('to-clear')"
                  @click.stop="linkHref = ''"
                />
              </template>
            </NatText>
            <div class="flex items-center justify-end gap-2.5 mt-4">
              <NatButton
                class="flex-auto sm:flex-initial sm:min-w-36"
                :label="t('cancel')"
                semantics="substrate"
                @click="close()"
              />
              <NatButton
                class="flex-auto sm:flex-initial sm:min-w-36"
                :label="t('ok')"
                semantics="accent"
                type="submit"
              >
                <slot name="ok" />
              </NatButton>
            </div>
          </NatForm>
        </div>
      </NatDialog>
      <div class="self-stretch w-0 border-substrate border-r-1 mx-0.5 sm:mx-1" />
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('heading', { level: 1 })"
        :tooltipText="t('rich-text.heading-number', { number: 1 })"
        :keysPc="['Control', 'Alt', '1']"
        :keysMac="['Cmd', 'Alt', '1']"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <span class="text-3.5">H1</span>
      </NatInputRichTextButton>
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('heading', { level: 2 })"
        :tooltipText="t('rich-text.heading-number', { number: 2 })"
        :keysPc="['Control', 'Alt', '2']"
        :keysMac="['Cmd', 'Alt', '2']"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <span class="text-3.5">H2</span>
      </NatInputRichTextButton>
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('heading', { level: 3 })"
        :tooltipText="t('rich-text.heading-number', { number: 3 })"
        :keysPc="['Control', 'Alt', '3']"
        :keysMac="['Cmd', 'Alt', '3']"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <span class="text-3.5">H3</span>
      </NatInputRichTextButton>
      <div class="self-stretch w-0 border-substrate border-r-1 mx-0.5 sm:mx-1" />
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('bulletList')"
        :tooltipText="t('rich-text.bullet-list')"
        :keysPc="['Control', 'Shift', '8']"
        :keysMac="['Cmd', 'Shift', '8']"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <IconIcBaselineFormatListBulleted />
      </NatInputRichTextButton>
      <NatInputRichTextButton
        :disabled="disabled"
        :active="editor.isActive('orderedList')"
        :tooltipText="t('rich-text.ordered-list')"
        :keysPc="['Control', 'Shift', '7']"
        :keysMac="['Cmd', 'Shift', '7']"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <IconIcBaselineFormatListNumbered />
      </NatInputRichTextButton>
    </div>
    <EditorContent
      class="prose max-w-none px-2.5"
      :class="editorClass"
      :editor="editor"
    />
  </div>
</template>
