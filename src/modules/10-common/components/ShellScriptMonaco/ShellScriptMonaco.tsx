/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { FormikProps, connect } from 'formik'
import { get } from 'lodash-es'
import { Button } from '@harness/uicore'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
import { useStrings } from 'framework/strings'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import css from './ShellScriptMonaco.module.scss'

export type ScriptType = 'Bash' | 'PowerShell'

const langMap: Record<ScriptType, string> = {
  Bash: 'shell',
  PowerShell: 'powershell'
}

export interface ShellScriptMonacoProps {
  title?: string
  scriptType: ScriptType
  name: string
  disabled?: boolean
  expressions?: string[]
  className?: string
  editorOptions?: editor.IEditorConstructionOptions
}

export interface ConnectedShellScriptMonacoProps extends ShellScriptMonacoProps {
  formik: FormikProps<unknown>
}

export function ShellScriptMonaco(props: ConnectedShellScriptMonacoProps): React.ReactElement {
  const { scriptType, formik, name, disabled, title, className, editorOptions } = props
  const [isFullScreen, setFullScreen] = useState(false)
  const [lineCount, setLineCount] = useState(0)
  const { getString } = useStrings()
  const value = get(formik.values, name) || ''

  const getHeight = (): number => {
    if (lineCount <= 5) {
      return 80
    }
    return 200
  }

  const editor = (
    <div
      className={cx(css.monacoWrapper, !isFullScreen && className)}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          event.stopPropagation()
        }
      }}
    >
      <MonacoEditor
        height={isFullScreen ? '70vh' : getHeight()}
        value={value}
        name={name}
        language={langMap[scriptType] as string}
        setLineCount={setLineCount}
        options={
          {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            minimap: {
              enabled: false
            },
            readOnly: disabled,
            scrollBeyondLastLine: false,
            ...editorOptions
          } as MonacoEditorProps['options']
        }
        onChange={txt => formik.setFieldValue(name, txt)}
      />
      {isFullScreen ? null : (
        <Button
          className={css.expandBtn}
          icon="fullscreen"
          small
          onClick={() => setFullScreen(true)}
          iconProps={{ size: 10 }}
        />
      )}
    </div>
  )
  return (
    <React.Fragment>
      {isFullScreen ? <div className={css.monacoWrapper} /> : editor}
      <Dialog
        lazy
        enforceFocus={false}
        isOpen={isFullScreen}
        isCloseButtonShown
        canOutsideClickClose={false}
        onClose={() => setFullScreen(false)}
        title={title ? title : `${getString('common.script')} (${scriptType})`}
        className={css.monacoDialog}
      >
        <div className={Classes.DIALOG_BODY}>{editor}</div>
      </Dialog>
    </React.Fragment>
  )
}

export const ShellScriptMonacoField = connect<ShellScriptMonacoProps>(ShellScriptMonaco as any)
