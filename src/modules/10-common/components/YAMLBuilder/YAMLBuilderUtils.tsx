/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { DetailedReactHTMLElement } from 'react'
import type { Diagnostic } from 'vscode-languageserver-types'
import { parse } from 'yaml'

import { findLeafToParentPath, getSchemaWithLanguageSettings, validateYAMLWithSchema } from '../../utils/YamlUtils'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { ToasterProps } from '@wings-software/uicore/dist/hooks/useToaster/useToaster'

/**
 * Get YAML from editor with placeholder added at current position in editor
 * @param editor
 * @param shouldAddPlaceholder whether to add a placeholder at current position in editor during yaml->json conversion
 */
const getYAMLFromEditor = (editor: any, shouldAddPlaceholder: boolean): string | null => {
  const currentPositionInEditor = editor?.getPosition(),
    textInCurrentEditorLine = editor?.getValue(currentPositionInEditor)?.trim(),
    currentLineNumber = currentPositionInEditor?.lineNumber,
    splitedText = textInCurrentEditorLine?.split('\n').slice(0, currentLineNumber),
    currentLineContent = splitedText?.[currentLineNumber - 1]
  const lengthOfCurrentText = textInCurrentEditorLine?.length
  if (lengthOfCurrentText > 0) {
    let textToInsert = ''
    if (shouldAddPlaceholder) {
      textToInsert = textInCurrentEditorLine[lengthOfCurrentText - 1] === ':' ? '' : ': ' + 'placeholder'
    }
    splitedText[currentLineNumber - 1] = [
      currentLineContent?.slice(0, currentPositionInEditor.column - 1),
      textToInsert,
      currentLineContent?.slice(currentPositionInEditor.column - 1)
    ].join('')
    editor.setPosition(currentPositionInEditor)
    return splitedText.join('\n')
  }
  return null
}

/**
 * Get current property to parent json path
 * @param editor
 * @param onErrorCallback
 * @param shouldAddPlaceholder
 */
const getMetaDataForKeyboardEventProcessing = ({
  editor,
  onErrorCallback,
  shouldAddPlaceholder = false
}: {
  editor: any
  onErrorCallback?: YamlBuilderProps['onErrorCallback']
  shouldAddPlaceholder?: boolean
}): Record<string, string | undefined> | undefined => {
  const yamlInEditor = getYAMLFromEditor(editor, shouldAddPlaceholder)
  if (yamlInEditor) {
    try {
      const jsonEquivalentOfYAMLInEditor = parse(yamlInEditor)
      const textInCurrentEditorLine = editor.getModel()?.getLineContent(editor.getPosition().lineNumber)
      const currentProperty = textInCurrentEditorLine?.split(':').map((item: string) => item.trim())[0]
      const parentToCurrentPropertyPath = findLeafToParentPath(jsonEquivalentOfYAMLInEditor, currentProperty)
      return { currentProperty, yamlInEditor, parentToCurrentPropertyPath }
    } catch (e) {
      onErrorCallback?.(e)
    }
  }
}

/**
 * Get mapping of json path of a property to all errors on the value at that property
 * @param currentYaml
 * @param validationErrors
 * @param editor
 */
const getYAMLValidationErrors = (validationErrors: Diagnostic[]): Map<number, string> => {
  const errorMap = new Map<number, string>()
  validationErrors.forEach(valError => {
    const errorIndex = valError?.range?.end?.line
    errorMap.set(errorIndex, valError?.message)
  })
  return errorMap
}

/**
 * Get formatted HTML of list items
 * @param errorMap yaml path to validation error map
 */
const getValidationErrorMessagesForToaster = (
  errorMap: Map<string, string[]>
): DetailedReactHTMLElement<{ id: string }, HTMLElement> => {
  const errorRenderItemList: JSX.Element[] = []
  errorMap?.forEach((values: string[], key: string) => {
    errorRenderItemList.push(
      <li key={key}>
        In{' '}
        <b>
          <i>{key}</i>
        </b>
        , {values?.map((value: string) => value.charAt(0).toLowerCase() + value.slice(1))?.join(', ')}
      </li>
    )
  })
  return React.createElement('ul', { id: 'ul-errors' }, errorRenderItemList)
}

const verifyYAML = (args: {
  updatedYaml: string
  setYamlValidationErrors: (yamlValidationErrors: Map<number, string> | undefined) => void
  showError: ToasterProps['showError']
  errorMessage: string
  schema?: Record<string, any>
}): void => {
  const { updatedYaml, setYamlValidationErrors, showError, schema, errorMessage } = args
  if (!schema) {
    return
  }
  if (updatedYaml) {
    try {
      validateYAMLWithSchema(updatedYaml, getSchemaWithLanguageSettings(schema))
        .then((errors: Diagnostic[]) => {
          setYamlValidationErrors(getYAMLValidationErrors(errors))
        })
        .catch((error: string) => {
          showError(error, 5000)
        })
    } catch (err) {
      showError(errorMessage)
    }
    return
  }
  setYamlValidationErrors(undefined)
}

export {
  getYAMLFromEditor,
  getMetaDataForKeyboardEventProcessing,
  getYAMLValidationErrors,
  getValidationErrorMessagesForToaster,
  verifyYAML
}
