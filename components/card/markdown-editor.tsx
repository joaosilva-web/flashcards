'use client'

import { useRef, useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Calculator, Superscript, Subscript } from 'lucide-react'
import { parseMarkdownToHtml } from '@/lib/parsers/markdown-parser'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  showPreview?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  disabled,
  label,
  showPreview = true,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState('<p class="text-muted-foreground text-sm">Preview aparecerá aqui...</p>')

  useEffect(() => {
    if (value && value.trim()) {
      const html = parseMarkdownToHtml(value)
      setPreview(html)
    } else {
      setPreview('<p class="text-muted-foreground text-sm">Preview aparecerá aqui...</p>')
    }
  }, [value])

  const insertFormatting = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      console.log('Textarea ref is null')
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue =
      value.substring(0, start) + before + textToInsert + after + value.substring(end)

    console.log('Inserting formatting:', { before, after, selectedText, newValue })
    onChange(newValue)

    // Reposicionar o cursor
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        const newCursorPos = start + before.length + textToInsert.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const formatButtons = [
    {
      icon: Bold,
      label: 'Negrito',
      action: () => insertFormatting('**', '**', 'texto'),
    },
    {
      icon: Italic,
      label: 'Itálico',
      action: () => insertFormatting('*', '*', 'texto'),
    },
    {
      icon: Calculator,
      label: 'Fórmula',
      action: () => insertFormatting('$', '$', 'x^2'),
    },
    {
      icon: Superscript,
      label: 'Sobrescrito',
      action: () => insertFormatting('^', '^', 'texto'),
    },
    {
      icon: Subscript,
      label: 'Subscrito',
      action: () => insertFormatting('~', '~', 'texto'),
    },
  ]

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      {/* Toolbar */}
      <div className="flex gap-1 p-1 border rounded-md bg-muted/50">
        {formatButtons.map((btn, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={btn.action}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title={btn.label}
          >
            <btn.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        className="font-mono text-sm"
      />

      {/* Live Preview */}
      {showPreview && (
        <div className="border rounded-md p-4 bg-card min-h-[100px]">
          <p className="text-xs text-muted-foreground mb-2">Preview ao vivo:</p>
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  )
}
