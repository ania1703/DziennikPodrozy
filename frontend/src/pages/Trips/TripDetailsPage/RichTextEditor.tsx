import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import TitleIcon from '@mui/icons-material/Title'
import IconButton from '@mui/material/IconButton'
import { toHtml } from '../../../utils/richText'
import { EditorFrame, EditorToolbar } from './TripDetailsPage.styles'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        heading: { levels: [2] },
      }),
    ],
    content: toHtml(value),
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
  })

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      heading: current?.isActive('heading', { level: 2 }) ?? false,
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
    }),
  })

  if (!editor) {
    return null
  }

  return (
    <EditorFrame>
      <EditorToolbar>
        <IconButton
          size="small"
          aria-label="Pogrubienie"
          color={active?.bold ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          aria-label="Kursywa"
          color={active?.italic ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          aria-label="Nagłówek"
          color={active?.heading ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <TitleIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          aria-label="Lista punktowana"
          color={active?.bulletList ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          aria-label="Lista numerowana"
          color={active?.orderedList ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>
      </EditorToolbar>

      <EditorContent editor={editor} />
    </EditorFrame>
  )
}

export default RichTextEditor