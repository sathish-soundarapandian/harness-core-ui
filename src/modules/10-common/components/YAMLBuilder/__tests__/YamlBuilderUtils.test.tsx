/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from 'yaml'
import type { editor, Position } from 'monaco-editor/esm/vs/editor/editor.api'
import type { Diagnostic } from 'vscode-languageserver-types'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import {
  getYAMLFromEditor,
  getMetaDataForKeyboardEventProcessing,
  getYAMLValidationErrors,
  findPositionsForMatchingKeys,
  getArrayIndexClosestToCurrentCursor,
  extractStepsFromStage,
  StepMatchRegex,
  StageMatchRegex,
  getValidStepPositions
} from '../YAMLBuilderUtils'

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
          getLineContent: (_lineNum: number) => `delegateName${_lineNum}: dn`,
          findMatches: (textToFind: string) => {
            return editorContent.match(textToFind)
              ? ([
                  { range: { endLineNumber: 2, endColumn: 5 } },
                  { range: { endLineNumber: 3, endColumn: 6 } }
                ] as editor.FindMatch[])
              : []
          }
        }
      ),
    setPosition: () => {}
  }
  return editor
}

const setupMockEditorWithDifferentMatchResults = (
  editorContent: string,
  position: { lineNumber: number; column: number },
  stepMatches?: editor.FindMatch[],
  stageMatches?: editor.FindMatch[]
): Record<string, any> => {
  const editor = {
    getPosition: () => Object.assign({}, position),
    getValue: () => editorContent,
    getModel: () =>
      Object.assign(
        {},
        {
          getLineContent: (_lineNum: number) => `delegateName${_lineNum}: dn`,
          findMatches: (textToFind: string) => {
            return textToFind === StepMatchRegex
              ? stepMatches ||
                  ([
                    { range: { endLineNumber: 4, endColumn: 10 } },
                    { range: { endLineNumber: 8, endColumn: 16 } },
                    { range: { endLineNumber: 12, endColumn: 16 } },
                    { range: { endLineNumber: 20, endColumn: 16 } },
                    { range: { endLineNumber: 28, endColumn: 16 } }
                  ] as editor.FindMatch[])
              : textToFind === StageMatchRegex
              ? stageMatches ||
                ([
                  { range: { endLineNumber: 7, endColumn: 13 } },
                  { range: { endLineNumber: 9, endColumn: 13 } }
                ] as editor.FindMatch[])
              : []
          }
        }
      ),
    setPosition: () => {}
  }
  return editor
}

const test_pipeline = {
  version: 1,
  name: 'Sample Pipeline_1677789896821',
  stages: [
    {
      name: 'build',
      type: 'ci',
      spec: {
        steps: [
          {
            name: 'Run echo_1',
            type: 'script',
            spec: {
              run: 'echo "Hello build1!"'
            }
          },
          {
            name: 'Run echo_2',
            type: 'script',
            spec: {
              run: 'echo "Hello build1!"'
            }
          }
        ]
      }
    },
    {
      name: 'build2',
      type: 'ci',
      spec: {
        steps: [
          {
            name: 'Run echo_3',
            type: 'script',
            spec: {
              run: 'echo "Hello build2!"'
            }
          }
        ]
      }
    }
  ]
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

  test('Test findPositionsForMatchingKeys method', () => {
    const editorContent =
      'version: 1\nname: Sample Pipeline_1677789896821\nstages:\n  - name: build\n    type: ci\n    spec:\n      steps:\n        - name: Run echo\n          type: script\n          spec:\n            run: echo "Hello Harness CI!"\n  - name: build2\n    type: ci\n    spec:\n      steps:\n        - name: Run echo\n          type: script\n          spec:\n            run: echo "Hello Harness CI!"'
    expect(
      /* Adding ts-ignore here as we do not need to mock the entire editor and only need to mock the methods/apis used from editor and editor's model */

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      findPositionsForMatchingKeys(setupMockEditor(editorContent, { lineNumber: 17, column: 19 }), 'steps').length
    ).toBe(2)
    expect(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      findPositionsForMatchingKeys(setupMockEditor(editorContent, { lineNumber: 17, column: 19 }), 'target').length
    ).toBe(0)
  })

  test('Test getArrayIndexClosestToCurrentCursor method', () => {
    const args = {
      editor: setupMockEditorWithDifferentMatchResults(yamlStringify(test_pipeline), {
        lineNumber: 17,
        column: 19
      }) as editor.IStandaloneCodeEditor,
      searchToken: StepMatchRegex,
      sourcePosition: { lineNumber: 0, column: 0 } as Position
    }
    // test for "step" lookup
    expect(getArrayIndexClosestToCurrentCursor({ ...args })).toBe(0)
    expect(
      getArrayIndexClosestToCurrentCursor({ ...args, sourcePosition: { lineNumber: 7, column: 5 } as Position })
    ).toBe(0)
    expect(
      getArrayIndexClosestToCurrentCursor({ ...args, sourcePosition: { lineNumber: 10, column: 5 } as Position })
    ).toBe(0)
    expect(
      getArrayIndexClosestToCurrentCursor({ ...args, sourcePosition: { lineNumber: 12, column: 5 } as Position })
    ).toBe(1)
    expect(
      getArrayIndexClosestToCurrentCursor({ ...args, sourcePosition: { lineNumber: 15, column: 5 } as Position })
    ).toBe(1)

    expect(
      getArrayIndexClosestToCurrentCursor({ ...args, sourcePosition: { lineNumber: 16, column: 5 } as Position })
    ).toBe(1)
    expect(
      getArrayIndexClosestToCurrentCursor({ ...args, sourcePosition: { lineNumber: 22, column: 5 } as Position })
    ).toBe(1)

    // test for "step" lookup
    expect(getArrayIndexClosestToCurrentCursor({ ...args, searchToken: StageMatchRegex })).toBe(0)
    expect(
      getArrayIndexClosestToCurrentCursor({
        ...args,
        searchToken: StageMatchRegex,
        sourcePosition: { lineNumber: 22, column: 5 } as Position
      })
    ).toBe(1)
  })

  test('Test extractStepsFromStage method', () => {
    expect(extractStepsFromStage({}, '')).toBe('')
    expect(extractStepsFromStage({}, 'a')).toBe('')
    expect(extractStepsFromStage({ a: 1 }, 'a')).toBe(1)
    expect(extractStepsFromStage({ a: 1 }, 'a.b')).toBe('')
    expect(extractStepsFromStage({ a: 1, b: 2 }, 'b')).toBe(2)
    expect(extractStepsFromStage({ a: 1, b: { c: 3 } }, 'b.c')).toBe(3)
    expect(extractStepsFromStage({ a: 1, b: { c: 3, d: { e: 4 } } }, 'b.d.e')).toBe(4)
    expect(extractStepsFromStage({ a: 1, b: { c: 3, d: { e: 4 } } }, 'a*e')).toBe('')

    expect(extractStepsFromStage(test_pipeline, `stages.0.spec.steps`)).toBeDefined()
    expect((extractStepsFromStage(test_pipeline, `stages.0.spec.steps`) as unknown[]).length).toBe(2)
    expect(extractStepsFromStage(test_pipeline, `stages.1.spec.steps`)).toBeDefined()
    expect((extractStepsFromStage(test_pipeline, `stages.1.spec.steps`) as unknown[]).length).toBe(1)
    expect(extractStepsFromStage(test_pipeline, `stages.3.spec.steps`)).toBe('')
  })

  test('Test getValidStepPositions method', () => {
    expect(
      getValidStepPositions(
        setupMockEditorWithDifferentMatchResults(yamlStringify(test_pipeline), {
          lineNumber: 17,
          column: 19
        }) as editor.IStandaloneCodeEditor
      ).length
    ).toBe(3)
    expect(
      getValidStepPositions(
        setupMockEditorWithDifferentMatchResults(
          yamlStringify(test_pipeline),
          {
            lineNumber: 17,
            column: 19
          },
          [
            { range: { endLineNumber: 4, endColumn: 10 } },
            { range: { endLineNumber: 8, endColumn: 16 } },
            { range: { endLineNumber: 12, endColumn: 16 } }
          ] as editor.FindMatch[],
          [{ range: { endLineNumber: 2, endColumn: 10 } }] as editor.FindMatch[]
        ) as editor.IStandaloneCodeEditor
      ).length
    ).toBe(2)
  })
})
