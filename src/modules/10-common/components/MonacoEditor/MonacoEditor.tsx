/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import MonacoEditor, { EditorDidMount, EditorWillMount, MonacoEditorProps, ChangeHandler } from 'react-monaco-editor'
import { suppressHotJarRecording } from '@common/utils/utils'
import { setupMonacoEnvironment } from '@common/utils/MonacoEditorUtils'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'

// TODO: check this import
// import { StaticServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices'
// StaticServices.configurationService.get().updateValue('files.eol', '\n')

//TODO: add automaticLayout: true to options

export interface ExtendedMonacoEditorProps extends MonacoEditorProps {
  name?: string
  setLineCount?: (line: number) => void
  'data-testid'?: string
}

export type MonacoEditorRef = editor.IStandaloneCodeEditor

const _MonacoEditor = React.forwardRef<MonacoEditorRef, ExtendedMonacoEditorProps>((props, _ref) => {
  const fallbackRef = useRef<editor.IStandaloneCodeEditor>(null)
  const ref = _ref || fallbackRef

  const _editorWillMount: EditorWillMount = monaco => {
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [{ token: 'string.yaml', background: 'f3f3fa' }], //TODO: check what token can be used https://github.com/microsoft/vscode/blob/913e891c34f8b4fe2c0767ec9f8bfd3b9dbe30d9/src/vs/editor/standalone/common/themes.ts#L13
      colors: {
        'editor.background': '#f3f3fa'
      }
    })
    setupMonacoEnvironment()
    // Don't allow HotJar to record content in Yaml/Code editor(s)
    suppressHotJarRecording([...document.querySelectorAll('.react-monaco-editor-container')])
    props.editorWillMount?.(monaco)
  }

  const _editorDidMount: EditorDidMount = (editor, monaco) => {
    ref.current = editor
    props.setLineCount?.(editor.getModel()?.getLineCount()!)
    // TODO: font name should be a global (for all)
    const loaded = (document as any).fonts?.check?.('1em Roboto Mono')
    if (loaded) {
      monaco?.editor?.remeasureFonts()
    } else {
      ;(document as any).fonts?.ready?.then?.(monaco?.editor?.remeasureFonts)
    }

    props.editorDidMount?.(editor, monaco)
  }

  const _onChange: ChangeHandler = (value, event) => {
    if (ref?.current) {
      props.setLineCount?.(ref.current.getModel()?.getLineCount()!)
    }

    props.onChange?.(value, event)
  }

  return (
    <MonacoEditor
      {...props}
      theme={props.options?.readOnly ? 'disable-theme' : 'vs'}
      editorWillMount={_editorWillMount}
      editorDidMount={_editorDidMount}
      onChange={_onChange}
    />
  )
})

_MonacoEditor.displayName = 'ReactMonacoEditor'

export default _MonacoEditor
