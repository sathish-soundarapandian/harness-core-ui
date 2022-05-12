/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { MutableRefObject } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import type { MonacoEditorProps } from 'react-monaco-editor'
//@ts-ignore
import { StaticServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices'
import { suppressHotJarRecording } from '@common/utils/utils'
StaticServices.configurationService.get().updateValue('files.eol', '\n')

export type ReactMonacoEditorRef =
  | ((instance: ReactMonacoEditor | null) => void)
  | MutableRefObject<ReactMonacoEditor | null>
  | null

export interface ExtendedMonacoEditorProps extends MonacoEditorProps {
  name?: string
  'data-testid'?: string
}

const MonacoEditor = (props: ExtendedMonacoEditorProps, ref: ReactMonacoEditorRef) => {
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

  const editorWillMount = () => {
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [{ background: 'f3f3fa' }],
      colors: {
        'editor.background': '#f3f3fa'
      }
    })

    const getUrlPrefix = () => {
      let urlPrefix = `${window.location.origin}${window.location.pathname}`
      if (urlPrefix.charAt(urlPrefix.length - 1) !== '/') {
        urlPrefix += '/'
      }
      return urlPrefix
    }

    //@ts-ignore
    window.MonacoEnvironment = {
      getWorker(_workerId: unknown, label: string) {
        if (label === 'yaml') {
          const YamlWorker = new Worker(new URL(`${getUrlPrefix()}static/yamlWorker2.js`, import.meta.url))
          return YamlWorker
        }
        const EditorWorker = new Worker(new URL(`${getUrlPrefix()}static/editorWorker2.js`, import.meta.url))
        return EditorWorker
      }
    }

    // Don't allow HotJar to record content in Yaml/Code editor(s)
    suppressHotJarRecording([...document.querySelectorAll('.react-monaco-editor-container')])
  }

  const theme = props.options?.readOnly ? 'disable-theme' : 'vs'

  return <ReactMonacoEditor {...props} ref={ref} theme={theme} editorWillMount={editorWillMount} />
}

export default React.forwardRef(MonacoEditor)
