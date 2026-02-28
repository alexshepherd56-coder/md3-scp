import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, Highlighter, List, ListOrdered } from 'lucide-react'

interface TiptapEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
}

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Type your notes here...',
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: 'tiptap-highlight',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const insertImage = useCallback((file: File) => {
    if (!editor || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      editor.chain().focus().setImage({ src: base64 }).run()
    }
    reader.readAsDataURL(file)
  }, [editor])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      insertImage(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [insertImage])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    if (!target.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      Array.from(files).forEach(file => insertImage(file))
    }
  }, [insertImage])

  if (!editor) return null

  return (
    <div className="tiptap-editor-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Bubble Menu - appears on text selection */}
      <BubbleMenu
        editor={editor}
        className="bubble-menu"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`bubble-menu-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`bubble-menu-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`bubble-menu-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`bubble-menu-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
          title="Highlight"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>
        <div className="bubble-menu-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`bubble-menu-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`bubble-menu-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
      </BubbleMenu>

      {/* Editor */}
      <div
        className={`tiptap-editor-wrapper ${isDragging ? 'is-dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
