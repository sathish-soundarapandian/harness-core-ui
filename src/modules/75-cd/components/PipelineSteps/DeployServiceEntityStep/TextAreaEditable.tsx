import { Popover } from '@harness/uicore'
import React, { useMemo, useCallback, useRef, useState } from 'react'
import { Editor, Transforms, Range, createEditor, BaseEditor, Element } from 'slate'
import { Slate, Editable, ReactEditor, withReact, useSelected, useFocused, RenderElementProps } from 'slate-react'

const MentionExample = () => {
  const ref = useRef<HTMLDivElement | null>()
  const [target, setTarget] = useState<Range | undefined | null>()
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState('')
  const renderElement = useCallback(props => <Element1 {...props} />, [])
  const editor = useMemo(() => withVariables(withReact(createEditor())), [])

  const chars = CHARACTERS.filter(c => c.toLowerCase().startsWith(search.toLowerCase())).slice(0, 10)

  const onKeyDown = useCallback(
    event => {
      if (target && chars.length > 0) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            setIndex(index >= chars.length - 1 ? 0 : index + 1)
            break
          case 'ArrowUp':
            event.preventDefault()
            setIndex(index <= 0 ? chars.length - 1 : index - 1)
            break
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            Transforms.select(editor, target)
            insertMention(editor, chars[index])
            setTarget(null)
            break
          case 'Escape':
            event.preventDefault()
            setTarget(null)
            break
        }
      }
    },
    [chars, editor, index, target]
  )

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={() => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection)
          const wordBefore = Editor.before(editor, start, { unit: 'word' })
          const before = wordBefore && Editor.before(editor, wordBefore)
          const beforeRange = before && Editor.range(editor, before, start)
          const beforeText = beforeRange && Editor.string(editor, beforeRange)
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
          const after = Editor.after(editor, start)
          const afterRange = Editor.range(editor, start, after)
          const afterText = Editor.string(editor, afterRange)
          const afterMatch = afterText.match(/^(\s|$)/)

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange)
            setSearch(beforeMatch[1])
            setIndex(0)
            return
          }
        }

        setTarget(null)
      }}
    >
      <Editable renderElement={renderElement} onKeyDown={onKeyDown} placeholder="Enter some text..." />
      {target && chars.length > 0 && (
        <Popover>
          <div
            ref={ref as any}
            style={{
              position: 'absolute',
              zIndex: 1,
              padding: '3px',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)'
            }}
            data-cy="mentions-portal"
          >
            {chars.map((char, i) => (
              <div
                key={char}
                onClick={() => {
                  Transforms.select(editor, target)
                  insertMention(editor, char)
                  setTarget(null)
                }}
                style={{
                  padding: '1px 3px',
                  borderRadius: '3px',
                  background: i === index ? '#B4D5FF' : 'transparent'
                }}
              >
                {char}
              </div>
            ))}
          </div>
        </Popover>
      )}
    </Slate>
  )
}
type CustomElement = {
  type: 'variable'
  variable: string
  children: CustomText[]
}
type CustomText = { text: string }
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}
const withVariables = (editor: Editor) => {
  const { isInline, isVoid, markableVoid } = editor

  editor.isInline = (element: Element) => {
    return element.type === 'variable' ? true : isInline(element)
  }

  editor.isVoid = (element: Element) => {
    return element.type === 'variable' ? true : isVoid(element)
  }

  editor.markableVoid = (element: Element) => {
    return element.type === 'variable' || markableVoid(element)
  }

  return editor
}

const insertMention = (editor: any, character: any) => {
  const mention: CustomElement = {
    type: 'variable',
    variable: character,
    children: [{ text: '' }]
  }
  Transforms.insertNodes(editor, mention)
  Transforms.move(editor)
}

const VAR_REGEX = /(<\+[a-zA-z0-9_.]+?>)/
function deserialize(input: string): any {
  const split = input.split(VAR_REGEX)

  return [
    {
      type: 'paragraph',
      children: split.map(part => {
        if (part.match(VAR_REGEX)) {
          const variable = part.slice(2).slice(0, -1)
          return {
            type: 'variable',
            variable,
            children: [{ text: '' }]
          }
        }

        return { type: 'text', text: part }
      })
    }
  ]
}

const Element1 = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'variable':
      return <VariableElement {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

function VariableElement(props: RenderElementProps) {
  const { attributes, element, children } = props
  const selected = useSelected()
  const focused = useFocused()

  return (
    <span
      {...attributes}
      className="variable"
      style={{
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
        color: 'orange'
      }}
    >
      {children}&lt;+{element.variable}&gt;
    </span>
  )
}

const initialValue = deserialize('My name is <+user.name> and I am <+user.age> old')

const CHARACTERS = [
  'Aayla Secura',
  'Adi Gallia',
  'Admiral Dodd Rancit',
  'Admiral Firmus Piett',
  'Admiral Gial Ackbar',
  'Admiral Ozzel',
  'Admiral Raddus',
  'Admiral Terrinald Screed',
  'Admiral Trench',
  'Admiral U.O. Statura',
  'Agen Kolar',
  'Agent Kallus',
  'Aiolin and Morit Astarte',
  'Aks Moe',
  'Almec',
  'Alton Kastle',
  'Amee',
  'AP-5',
  'Armitage Hux',
  'Artoo',
  'Arvel Crynyd',
  'Asajj Ventress',
  'Aurra Sing',
  'AZI-3'
]

export default MentionExample
