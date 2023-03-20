import React from 'react'
import css from './TextAreaEditable.module.scss'

const VAR_REGEX = /(<\+[a-zA-z0-9_.]+?>)/

function deserialize(input: string): TextObject[] {
  const split = input.split(VAR_REGEX)

  return split.map(part => {
    if (part.match(VAR_REGEX)) {
      const variable = part.slice(2).slice(0, -1)
      return {
        type: 'variable',
        text: variable
      }
    }

    return { type: 'text', text: part }
  })
}

interface TextObject {
  type: string
  text: string
}

function highlight(input: TextObject[]): string {
  return input
    .flatMap(r => {
      if (r.type === 'variable') {
        return `<span style="color:darkorange">&lt;+${r.text}&gt;</span>`
      }

      return r.text
    })
    .join('')
}

function getCaretIndex(element: HTMLElement): number {
  let position = 0
  const selection = window.getSelection()

  if (selection?.rangeCount !== 0) {
    const range = (window.getSelection() as any).getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    position = preCaretRange.toString().length
  }

  return position
}

function setCaret(element: ChildNode, index: any): void {
  const range = document.createRange()
  range.setStartAfter(element, index)
  range.collapse(true)

  const sel = window.getSelection() as any
  sel.removeAllRanges()
  sel.addRange(range)
}

type TextAreaEditableProps = {
  text: string
  onInput: any
}

class TextAreaEditable extends React.Component<TextAreaEditableProps> {
  ref = React.createRef<HTMLDivElement>()

  shouldComponentUpdate(nextProps: TextAreaEditableProps) {
    return nextProps.text !== (this.ref.current as any)?.textContent
  }

  handleKeyDown(e: any): void {
    const { textContent } = e.target

    if (e.key === '>') {
      e.preventDefault()
      const index = getCaretIndex(e.target) + 2

      const newStr = textContent.slice(0, index) + e.key + textContent.slice(index).trimEnd() + ' '

      this.ref.current.innerHTML = highlight(deserialize(newStr))

      const childNodesTextLength = Array.from(this.ref.current.childNodes).reduce((arr, child, i) => {
        const l = child.textContent?.length
        console.log(child.textContent)
        const prev = arr[i - 1] || 0

        arr.push(l + prev)

        return arr
      }, [])

      const childIndex = childNodesTextLength.findIndex(i => {
        return i >= index
      })

      const child = this.ref.current.childNodes[childIndex]
      const offset = childNodesTextLength[childIndex] - index + 1

      setCaret(child, offset)
    }
  }

  render() {
    const { text, ...rest } = this.props
    return (
      <div
        className={css.editable}
        {...rest}
        ref={this.ref}
        contentEditable={'plaintext-only' as any}
        onKeyDown={this.handleKeyDown.bind(this)}
        dangerouslySetInnerHTML={{ __html: highlight(deserialize(text + ' ')) }}
      />
    )
  }
}

export default TextAreaEditable
