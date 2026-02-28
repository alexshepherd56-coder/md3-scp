import { useState, useEffect, useCallback, useRef } from 'react'
import { Highlighter, Underline, Undo2, MessageSquarePlus } from 'lucide-react'
import { useTextMarkup, HIGHLIGHT_COLORS } from '@/contexts/TextMarkupContext'
import { useAnnotations } from '@/contexts/AnnotationsContext'

interface TextMarkupToolbarProps {
  caseId: string
  containerRef: React.RefObject<HTMLElement | null>
}

// Store markup history for undo
interface MarkupHistoryEntry {
  element: HTMLElement
  parent: Node
  nextSibling: Node | null
  textContent: string
}

const markupHistory: MarkupHistoryEntry[] = []

export function TextMarkupToolbar({ caseId, containerRef }: TextMarkupToolbarProps) {
  const { addMarkup } = useTextMarkup()
  const { addInlineAnnotation } = useAnnotations()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number | null>(null)
  const [showAnnotationInput, setShowAnnotationInput] = useState(false)
  const [annotationComment, setAnnotationComment] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const annotationInputRef = useRef<HTMLTextAreaElement>(null)
  const selectionRangeRef = useRef<Range | null>(null)

  // Find question number from selection
  const getQuestionNumberFromSelection = useCallback((selection: Selection): number | null => {
    const anchorNode = selection.anchorNode
    if (!anchorNode) return null

    // Walk up the DOM tree to find the question container
    let element: HTMLElement | null = anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : anchorNode as HTMLElement

    while (element) {
      // Look for answer container with id like "answer-1"
      if (element.id && element.id.startsWith('answer-')) {
        const num = parseInt(element.id.replace('answer-', ''), 10)
        if (!isNaN(num)) return num
      }
      element = element.parentElement
    }
    return null
  }, [])

  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setIsVisible(false)
      setShowAnnotationInput(false)
      return
    }

    const text = selection.toString().trim()
    if (!text || text.length === 0) {
      setIsVisible(false)
      setShowAnnotationInput(false)
      return
    }

    // Check if selection is within the container
    const container = containerRef.current
    if (!container) return

    const anchorNode = selection.anchorNode
    if (!anchorNode || !container.contains(anchorNode)) {
      setIsVisible(false)
      setShowAnnotationInput(false)
      return
    }

    // Don't show toolbar for selections inside the notes editor (Tiptap) or any textarea
    const element = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode as HTMLElement
    if (element?.closest('.tiptap-editor-container, .ProseMirror, textarea, [contenteditable="true"]')) {
      setIsVisible(false)
      setShowAnnotationInput(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // Store the range for later use
    selectionRangeRef.current = range.cloneRange()

    // Position toolbar above the selection
    const toolbarWidth = 280
    const toolbarHeight = 44
    let left = rect.left + (rect.width / 2) - (toolbarWidth / 2)
    let top = rect.top - toolbarHeight - 10

    // Keep within viewport
    if (left < 10) left = 10
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10
    }
    if (top < 10) {
      top = rect.bottom + 10
    }

    setPosition({ top, left })
    setSelectedText(text)
    setCurrentQuestionNumber(getQuestionNumberFromSelection(selection))
    setIsVisible(true)
  }, [containerRef, getQuestionNumberFromSelection])

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return
      setTimeout(handleSelection, 10)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.key === 'Shift') {
        setTimeout(handleSelection, 10)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setIsVisible(false)
        setShowAnnotationInput(false)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleSelection])

  // Focus annotation input when shown
  useEffect(() => {
    if (showAnnotationInput && annotationInputRef.current) {
      annotationInputRef.current.focus()
    }
  }, [showAnnotationInput])

  // Get all text nodes within a range
  const getTextNodesInRange = (range: Range): Text[] => {
    const textNodes: Text[] = []
    const container = range.commonAncestorContainer

    if (container.nodeType === Node.TEXT_NODE) {
      textNodes.push(container as Text)
      return textNodes
    }

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const nodeRange = document.createRange()
          nodeRange.selectNode(node)
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
      }
    )

    let node: Text | null
    while ((node = walker.nextNode() as Text | null)) {
      textNodes.push(node)
    }

    return textNodes
  }

  // Record a markup for undo
  const recordMarkup = (span: HTMLElement) => {
    if (span.parentNode) {
      markupHistory.push({
        element: span,
        parent: span.parentNode,
        nextSibling: span.nextSibling,
        textContent: span.textContent || ''
      })
    }
  }

  // Undo last markup
  const undoLastMarkup = useCallback(() => {
    if (markupHistory.length === 0) return

    const lastEntry = markupHistory.pop()
    if (!lastEntry) return

    const { element } = lastEntry

    // Check if element is still in the DOM
    if (!element.parentNode) return

    // Unwrap the element
    const parent = element.parentNode
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element)
    }
    parent.removeChild(element)
    parent.normalize()
  }, [])

  // Listen for Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Only handle if we have markup history and focus is in our container
        if (markupHistory.length > 0 && containerRef.current) {
          e.preventDefault()
          undoLastMarkup()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undoLastMarkup, containerRef])

  // Wrap text nodes with highlight/underline spans
  const wrapTextNodes = (type: 'highlight' | 'underline' | 'annotation', color?: string, annotationId?: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !selectedText) return null

    const range = selectionRangeRef.current || selection.getRangeAt(0)

    // Collect text nodes first (before modifying DOM)
    const textNodes = getTextNodesInRange(range)
    if (textNodes.length === 0) return null

    // Store info about each text node before modifying
    const nodeInfos = textNodes.map((textNode, index) => {
      let startOffset = 0
      let endOffset = textNode.length

      if (index === 0 && textNode === range.startContainer) {
        startOffset = range.startOffset
      }
      if (index === textNodes.length - 1 && textNode === range.endContainer) {
        endOffset = range.endOffset
      }

      return { textNode, startOffset, endOffset }
    }).filter(info => {
      // Skip if no content to wrap
      if (info.startOffset >= info.endOffset) return false

      // Skip whitespace-only text nodes (newlines, spaces between elements)
      const textContent = info.textNode.textContent?.substring(info.startOffset, info.endOffset) || ''
      if (textContent.trim().length === 0) return false

      return true
    })

    if (nodeInfos.length === 0) return null

    const createdSpans: HTMLElement[] = []

    // Process nodes in reverse order to avoid offset issues
    for (let i = nodeInfos.length - 1; i >= 0; i--) {
      const { textNode, startOffset, endOffset } = nodeInfos[i]
      const parent = textNode.parentNode
      if (!parent) continue

      let targetNode: Text = textNode

      // Split at start if needed - targetNode becomes the "after" part
      if (startOffset > 0) {
        targetNode = textNode.splitText(startOffset)
      }

      // Split at end if needed (relative to targetNode which now starts at startOffset)
      const remainingLength = targetNode.length
      const neededLength = endOffset - startOffset
      if (neededLength < remainingLength) {
        targetNode.splitText(neededLength)
      }

      // Now targetNode contains exactly the selected text
      // Create the wrapper span
      const span = document.createElement('span')

      if (type === 'annotation') {
        span.className = 'text-annotation'
        span.dataset.markupType = 'annotation'
        span.dataset.annotationId = annotationId
      } else {
        span.className = type === 'highlight' ? 'text-highlight' : 'text-underline'
        span.dataset.markupType = type
      }

      if (type === 'highlight' && color) {
        span.style.backgroundColor = HIGHLIGHT_COLORS[color as keyof typeof HIGHLIGHT_COLORS] || HIGHLIGHT_COLORS.yellow
        span.dataset.color = color
      }

      // Wrap the actual DOM text node (not a copy) with the span
      parent.replaceChild(span, targetNode)
      span.appendChild(targetNode)

      // Add bubble icon for annotations (only on first span)
      if (type === 'annotation' && i === 0) {
        const bubble = document.createElement('span')
        bubble.className = 'annotation-bubble-icon'
        bubble.dataset.annotationId = annotationId
        bubble.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
        bubble.title = 'View annotation'
        span.insertBefore(bubble, span.firstChild)
      }

      createdSpans.unshift(span) // Add to front since we're processing in reverse
    }

    // Record all created spans for undo
    createdSpans.forEach(span => recordMarkup(span))

    if (type !== 'annotation') {
      addMarkup(caseId, {
        type,
        color,
        text: selectedText,
        startOffset: 0,
        endOffset: selectedText.length,
        parentSelector: ''
      })
    }

    return createdSpans[0] // Return first span for reference
  }

  const applyHighlight = (color: string) => {
    if (!selectedText) return
    wrapTextNodes('highlight', color)
    setIsVisible(false)
    setShowAnnotationInput(false)
    window.getSelection()?.removeAllRanges()
  }

  const applyUnderline = () => {
    if (!selectedText) return
    wrapTextNodes('underline')
    setIsVisible(false)
    setShowAnnotationInput(false)
    window.getSelection()?.removeAllRanges()
  }

  const startAnnotation = () => {
    setShowAnnotationInput(true)
    setAnnotationComment('')
  }

  const saveAnnotation = () => {
    if (!selectedText || currentQuestionNumber === null) return

    // Save to context first to get the ID
    const annotationId = addInlineAnnotation(caseId, currentQuestionNumber, selectedText, annotationComment)

    // Wrap the text with annotation styling and bubble
    wrapTextNodes('annotation', undefined, annotationId)

    setIsVisible(false)
    setShowAnnotationInput(false)
    setAnnotationComment('')
    window.getSelection()?.removeAllRanges()
  }

  const cancelAnnotation = () => {
    setShowAnnotationInput(false)
    setAnnotationComment('')
  }

  if (!isVisible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[10000] animate-in fade-in duration-150"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex flex-col bg-white dark:bg-[#1a1a1a] border border-[#E8E3D9] dark:border-[#333] rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1.5">
          {/* Highlight button */}
          <button
            onClick={() => applyHighlight('yellow')}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 transition-colors"
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Underline button */}
          <button
            onClick={applyUnderline}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-[#D97757] transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* Undo button */}
          <button
            onClick={undoLastMarkup}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title="Undo last markup"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Add Comment button - only in answer sections */}
          {currentQuestionNumber !== null && (
            <>
              <div className="w-px h-4 bg-[#E8E3D9] dark:bg-[#444] mx-0.5" />
              <button
                onClick={startAnnotation}
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                  showAnnotationInput
                    ? 'bg-[#667eea] text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-[#667eea]'
                }`}
                title="Add comment"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Annotation input panel */}
        {showAnnotationInput && (
          <div className="border-t border-[#E8E3D9] dark:border-[#333] p-3">
            <textarea
              ref={annotationInputRef}
              value={annotationComment}
              onChange={(e) => setAnnotationComment(e.target.value)}
              placeholder="Add your comment..."
              className="w-full min-w-[240px] p-2 text-sm bg-[#F9F6F1] dark:bg-gray-800 border border-[#E8E3D9] dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:border-[#667eea]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  saveAnnotation()
                }
                if (e.key === 'Escape') {
                  cancelAnnotation()
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={cancelAnnotation}
                className="px-3 py-1.5 text-xs font-medium text-[#4B535A] hover:text-[#0A0A0A] dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAnnotation}
                className="px-3 py-1.5 text-xs font-medium bg-[#667eea] text-white rounded-lg hover:bg-[#5a6fd6] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
