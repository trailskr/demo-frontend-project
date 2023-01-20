declare module 'tiptap-markdown' {
  import { Editor } from '@tiptap/vue-3'

  export declare class MarkdownEditor extends Editor {
    // eslint-disable-next-line no-use-before-define
    constructor(options?: Partial<MarkdownEditorOptions>)
    getMarkdown: () => string
  }

  export interface MarkdownEditorEvents {
    beforeCreate: {
        editor: MarkdownEditor
    }
    create: {
        editor: MarkdownEditor
    }
    update: {
        editor: MarkdownEditor
        transaction: Transaction
    }
    selectionUpdate: {
        editor: MarkdownEditor
        transaction: Transaction
    }
    transaction: {
        editor: MarkdownEditor
        transaction: Transaction
    }
    focus: {
        editor: MarkdownEditor
        event: FocusEvent
        transaction: Transaction
    }
    blur: {
        editor: MarkdownEditor
        event: FocusEvent
        transaction: Transaction
    }
    destroy: void
  }

  export interface MarkdownEditorOptions {
    element: Element
    content: Content
    extensions: Extensions
    injectCSS: boolean
    autofocus: FocusPosition
    editable: boolean
    editorProps: EditorProps
    parseOptions: ParseOptions
    enableInputRules: EnableRules
    enablePasteRules: EnableRules
    enableCoreExtensions: boolean
    onBeforeCreate: (props: MarkdownEditorEvents['beforeCreate']) => void
    onCreate: (props: MarkdownEditorEvents['create']) => void
    onUpdate: (props: MarkdownEditorEvents['update']) => void
    onSelectionUpdate: (props: MarkdownEditorEvents['selectionUpdate']) => void
    onTransaction: (props: MarkdownEditorEvents['transaction']) => void
    onFocus: (props: MarkdownEditorEvents['focus']) => void
    onBlur: (props: MarkdownEditorEvents['blur']) => void
    onDestroy: (props: MarkdownEditorEvents['destroy']) => void
  }

  export declare const createMarkdownEditor: (Editor: typeof Editor) => typeof MarkdownEditor
}
