import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import Typography from '@tiptap/extension-typography'

export const extensions = [
  Document,
  Paragraph,
  Text,
  History,
  Bold,
  Italic,
  Strike,
  Link.configure({
    openOnClick: false
  }),
  Heading.configure({
    levels: [1, 2, 3]
  }),
  ListItem,
  BulletList,
  OrderedList,
  HardBreak,
  Typography
]
