/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { MutableRefObject, useRef } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import type { MonacoEditorProps } from 'react-monaco-editor'
//@ts-ignore
import { StaticServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices'
import { suppressHotJarRecording } from '@common/utils/utils'
import { setupMonacoEnvironment } from '@common/utils/MonacoEditorUtils'
StaticServices.configurationService.get().updateValue('files.eol', '\n')

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
  React.useEffect(() => {
    const remeasureFonts = () => {
      //@ts-ignore
      monaco?.editor?.remeasureFonts()
    }

    // TODO: font name should be a global (for all)
    const loaded = (document as any).fonts?.check?.('1em Roboto Mono')

    if (loaded) {
      remeasureFonts()
    } else {
      ;(document as any).fonts?.ready?.then?.(remeasureFonts)
    }
  }, [])

  function handleHTMLEditorDidMount(editor: any, monaco: any) {
    props.setLineCount && props.setLineCount(editor.getModel().getLineCount())
    customHTMLRef.current = editor
    props.editorDidMount?.(editor, monaco)
  }

  const editorWillMount = () => {
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [{ background: 'f3f3fa' }],
      colors: {
        'editor.background': '#f3f3fa'
      }
    })
    setupMonacoEnvironment()

    // Don't allow HotJar to record content in Yaml/Code editor(s)
    suppressHotJarRecording([...document.querySelectorAll('.react-monaco-editor-container')])
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
      editorWillMount={editorWillMount}
    />
  )
}

export default React.forwardRef(MonacoEditor)
