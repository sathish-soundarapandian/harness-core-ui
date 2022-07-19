/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { MonacoEditorBaseProps, MonacoEditorProps } from 'react-monaco-editor'
import { FormikProps, connect } from 'formik'
import { defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import { Dialog, Classes } from '@blueprintjs/core'
import { Button, Container } from '@harness/uicore'
import type { languages, IDisposable } from 'monaco-editor/esm/vs/editor/editor.api'
import { useStrings } from 'framework/strings'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { useDeepCompareEffect } from '@common/hooks'

import css from './MonacoTextField.module.scss'

type Languages = typeof languages

export interface MonacoTextFieldProps {
  name: string
  height?: MonacoEditorBaseProps['height']
  disabled?: boolean
  expressions?: string[]
  'data-testid'?: string
  fullScreenAllowed?: boolean
  fullScreenTitle?: string
}

export interface ConnectedMonacoTextFieldProps extends MonacoTextFieldProps {
  formik: FormikProps<unknown>
}

const VAR_REGEX = /.*<\+.*?/
const LANG_ID = 'plaintext'

export const getDefaultMonacoConfig = (disabled: boolean): MonacoEditorProps['options'] => ({
  fontFamily: "'Roboto Mono', monospace",
  fontSize: 14,
  minimap: {
    enabled: false
  },
  readOnly: disabled,
  scrollBeyondLastLine: false,
  lineNumbers: 'off',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  wordWrap: 'on',
  scrollbar: {
    verticalScrollbarSize: 0
  },
  renderLineHighlight: 'none',
  wordWrapBreakBeforeCharacters: '',
  mouseStyle: disabled ? 'default' : 'text',
  lineNumbersMinChars: 0
})

export function MonacoText(props: ConnectedMonacoTextFieldProps): React.ReactElement {
  const { formik, name, disabled, expressions, height = 70, fullScreenAllowed, fullScreenTitle } = props
  const [isFullScreen, setFullScreen] = React.useState(false)
  const { getString } = useStrings()
  const value = get(formik.values, name) || ''

  useDeepCompareEffect(() => {
    let disposable: IDisposable | null = null

    if (Array.isArray(expressions) && expressions.length > 0) {
      const suggestions: Array<Partial<languages.CompletionItem>> = expressions
        .filter(label => label)
        .map(label => ({
          label,
          insertText: label + '>',
          kind: 13
        }))

      disposable = (monaco?.languages as Languages)?.registerCompletionItemProvider(LANG_ID, {
        triggerCharacters: ['+', '.'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideCompletionItems(model, position): any {
          const prevText = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 0,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          })

          if (VAR_REGEX.test(prevText)) {
            return { suggestions }
          }

          return { suggestions: [] }
        }
      })
    }

    return () => {
      disposable?.dispose()
    }
  }, [expressions])

  const editor = (
    <div className={cx(css.main, { [css.disabled]: disabled })}>
      <MonacoEditor
        height={fullScreenAllowed && isFullScreen ? '70vh' : height}
        value={value}
        language={LANG_ID}
        options={getDefaultMonacoConfig(!!disabled)}
        onChange={txt => formik.setFieldValue(name, txt)}
        {...({ name: props.name, 'data-testid': props['data-testid'] } as any)} // this is required for test cases
      />
      {fullScreenAllowed && !isFullScreen ? (
        <Button
          className={css.expandBtn}
          icon="fullscreen"
          small
          onClick={() => setFullScreen(true)}
          iconProps={{ size: 10 }}
        />
      ) : null}
    </div>
  )

  return (
    <React.Fragment>
      {fullScreenAllowed && isFullScreen ? <Container className={css.main} /> : editor}
      <Dialog
        lazy
        enforceFocus={false}
        isOpen={isFullScreen}
        isCloseButtonShown
        canOutsideClickClose={false}
        onClose={() => setFullScreen(false)}
        title={defaultTo(fullScreenTitle, getString('common.input'))}
        className={css.monacoDialog}
      >
        <div className={Classes.DIALOG_BODY}>{editor}</div>
      </Dialog>
    </React.Fragment>
  )
}

export const MonacoTextField = connect<MonacoTextFieldProps>(MonacoText as any)
