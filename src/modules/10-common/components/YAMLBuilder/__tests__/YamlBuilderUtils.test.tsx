/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getYAMLFromEditor, getMetaDataForKeyboardEventProcessing, getYAMLValidationErrors } from '../YAMLBuilderUtils'
import { parse } from 'yaml'
import type { Diagnostic } from 'vscode-languageserver-types'

jest.mock('@harness/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

const setupMockEditor = (
  editorContent: string,
  position: { lineNumber: number; column: number }
): Record<string, any> => {
  const editor = {
    getPosition: () => Object.assign({}, position),
    getValue: () => editorContent,
    getModel: () =>
      Object.assign(
        {},
        {
          getLineContent: (_lineNum: number) => `delegateName${_lineNum}: dn`
        }
      ),
    setPosition: () => {}
  }
  return editor
}

describe('YAMLBuilder Utils test', () => {
  test('Test getYAMLFromEditor method, should add placeholder', async () => {
    const editorContent =
      'name: K8sConnector\r\nidentifier: SampleK8s\r\ndescription: Sample K8s connectors\r\naccountIdentifier: ACCOUNT_ID\r\ntags: \r\n  - dev-ops\r\n  - env\r\nlastModifiedAt: 123456789\r\ntype \r\nspec:\r\n  type: InheritFromDelegate\r\n  spec:\r\n    delegateName: delegatek8s'
    const yaml = getYAMLFromEditor(setupMockEditor(editorContent, { lineNumber: 9, column: 7 }), true)
    expect(yaml).not.toBeNull()
    if (yaml) {
      const jsonEquivalent = parse(yaml)
      expect(jsonEquivalent.type).toEqual('placeholder')
    }
  })

  test('Test getYAMLFromEditor method, should not add placeholder', async () => {
    const editorContent =
      'name: K8sConnector\r\nidentifier: SampleK8s\r\ndescription: Sample K8s connectors\r\naccountIdentifier: ACCOUNT_ID\r\ntags:\r\n  - dev-ops\r\n  - env\r\nlastModifiedAt: 123456789\r\ntype: K8s\r\nspec:\r\n  type: InheritFromDelegate\r\n  spec:\r\n    delegateName: delegatek8s'
    const yaml = getYAMLFromEditor(setupMockEditor(editorContent, { lineNumber: 9, column: 7 }), false)
    expect(yaml).not.toBeNull()
    if (yaml) {
      const jsonEquivalent = parse(yaml)
      expect(jsonEquivalent.type).not.toEqual('placeholder')
    }
  })

  test('Test getMetaDataForKeyboardEventProcessing method', async () => {
    const editorContent =
      'name: K8sConnector\r\nidentifier: SampleK8s\r\ndescription: Sample K8s connectors\r\naccountIdentifier: ACCOUNT_ID\r\ntags:\r\n  - dev-ops\r\n  - env\r\nlastModifiedAt: 123456789\r\ntype: K8s\r\nspec:\r\n  type: InheritFromDelegate\r\n  spec:\r\n    delegateName: delegatek8s'
    const { currentProperty } = getMetaDataForKeyboardEventProcessing({
      editor: setupMockEditor(editorContent, { lineNumber: 17, column: 19 }),
      onErrorCallback: () => {},
      shouldAddPlaceholder: true
    }) as { currentProperty: string; yamlInEditor: string; parentToCurrentPropertyPath: string | null }
    expect(currentProperty).toEqual('delegateName17')
  })

  test('Test getYAMLValidationErrors method', async () => {
    const validationErrors = [
      { message: 'Expected number but found string', range: { end: { line: 2 } } } as Diagnostic
    ]
    let errorMap = getYAMLValidationErrors(validationErrors)
    expect(errorMap).not.toBeNull()
    expect(errorMap?.size).toEqual(1)
    expect(errorMap?.get(2)).toEqual('Expected number but found string')
    validationErrors.push({ message: 'Incorrect type', range: { end: { line: 2 } } } as Diagnostic)
    errorMap = getYAMLValidationErrors(validationErrors)
    expect(errorMap).not.toBeNull()
    expect(errorMap?.size).toEqual(1)
    const errorMssgs = errorMap?.get(2)
    expect(errorMssgs).toEqual('Incorrect type')
  })
})
