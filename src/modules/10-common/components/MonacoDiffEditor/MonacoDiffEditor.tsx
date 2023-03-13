/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import {
  MonacoDiffEditorProps,
  DiffEditorDidMount,
  DiffEditorWillMount,
  DiffChangeHandler,
  MonacoDiffEditor
} from 'react-monaco-editor'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
import { suppressHotJarRecording } from '@common/utils/utils'
import { setupMonacoEnvironment } from '@common/utils/MonacoEditorUtils'

export interface ExtendedMonacoDiffEditorProps extends MonacoDiffEditorProps {
  name?: string
  'data-testid'?: string
}

export type MonacoDiffEditorRef = editor.IDiffEditor

const _MonacoDiffEditor = React.forwardRef<MonacoDiffEditorRef, ExtendedMonacoDiffEditorProps>((props, _ref) => {
  const ref = useRef<editor.IDiffEditor>((_ref as any)?.current)

  const _editorWillMount: DiffEditorWillMount = monaco => {
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

  const _editorDidMount: DiffEditorDidMount = (editor, monaco) => {
    ref.current = editor
    // TODO: font name should be a global (for all)
    const loaded = (document as any).fonts?.check?.('1em Roboto Mono')
    if (loaded) {
      monaco?.editor?.remeasureFonts()
    } else {
      ;(document as any).fonts?.ready?.then?.(monaco?.editor?.remeasureFonts)
    }

    props.editorDidMount?.(editor, monaco)
  }

  const _onChange: DiffChangeHandler = (value, event) => {
    props.onChange?.(value, event)
  }

  return (
    <MonacoDiffEditor
      {...props}
      theme={props.options?.readOnly ? 'disable-theme' : 'vs'}
      editorWillMount={_editorWillMount}
      editorDidMount={_editorDidMount}
      onChange={_onChange}
    />
  )
})

_MonacoDiffEditor.displayName = 'ReactMonacoDiffEditor'

export default _MonacoDiffEditor
