/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { MutableRefObject, useRef } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import type { MonacoEditorProps } from 'react-monaco-editor'

export type ReactMonacoEditorRef =
  | ((instance: ReactMonacoEditor | null) => void)
  | MutableRefObject<ReactMonacoEditor | null>
  | null

export interface ExtendedMonacoEditorProps extends MonacoEditorProps {
  name?: string
  setLineCount?: (line: number) => void
  'data-testid'?: string
}

const MonacoEditor = (props: ExtendedMonacoEditorProps, ref: ReactMonacoEditorRef) => {
  const customHTMLRef = useRef<any>(null)

  function handleHTMLEditorDidMount(editor: any, monaco: any) {
    props.setLineCount && props.setLineCount(editor.getModel().getLineCount())
    customHTMLRef.current = editor
    props.editorDidMount?.(editor, monaco)
  }

  const theme = props.options?.readOnly ? 'disable-theme' : 'vs'
  return (
    <ReactMonacoEditor
      {...props}
      ref={ref}
      editorDidMount={handleHTMLEditorDidMount}
      onChange={(value, e) => {
        props.onChange && props.onChange(value, e)
        if (customHTMLRef?.current?.getModel) {
          props.setLineCount && props.setLineCount(customHTMLRef.current.getModel().getLineCount())
        }
      }}
      theme={theme}
    />
  )
}

export default React.forwardRef(MonacoEditor)
