/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { TemplateType } from '@templates-library/utils/templatesUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  getTemplateContextMock,
  secretManagerTemplateMock,
  secretManagerTemplateMockWithExecutionTarget
} from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { ScriptTemplateCanvasWithRef } from '../ScriptTemplateCanvas'
import type { ScriptTemplateFormInterface } from '../ScriptTemplateForm/ScriptTemplateForm'

const scriptTemplateContextMock = getTemplateContextMock(TemplateType.SecretManager)

const scriptTemplateContextMockWrapper = {
  ...scriptTemplateContextMock,
  testData: {}
}

jest.mock('../ScriptTemplateForm/ScriptTemplateForm', () => ({
  ...(jest.requireActual('../ScriptTemplateForm/ScriptTemplateForm') as any),
  ScriptTemplateFormWithRef: React.forwardRef(({ updateTemplate }: ScriptTemplateFormInterface, _ref: any) => {
    return (
      <div className="script-form-mock">
        <button
          onClick={() => {
            updateTemplate?.(scriptTemplateContextMockWrapper.testData as any)
          }}
        >
          onChange Button
        </button>
      </div>
    )
  })
}))
describe('Test ScriptTemplateCanvasWithRef', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.mock('../ScriptTemplateForm/ScriptTemplateForm', () => ({
      ...(jest.requireActual('../ScriptTemplateForm/ScriptTemplateForm') as any),
      ScriptTemplateFormWithRef: React.forwardRef(({ updateTemplate }: ScriptTemplateFormInterface, _ref: any) => {
        return (
          <div className="script-form-mock">
            <button
              onClick={() => {
                updateTemplate?.(scriptTemplateContextMockWrapper.testData as any)
              }}
            >
              onChange Button
            </button>
          </div>
        )
      })
    }))
  })
  test('should match snapshot for ScriptTemplateCanvasWithRef', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TemplateContext.Provider value={scriptTemplateContextMock}>
          <ScriptTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    await waitFor(() => getByText('onChange Button'))
    expect(container).toMatchSnapshot()
  })

  test('should call updateTemplate with correctly when form is updated', async () => {
    scriptTemplateContextMock.state.template = { ...secretManagerTemplateMock, spec: undefined }
    scriptTemplateContextMockWrapper.testData = secretManagerTemplateMock
    const { getByText } = render(
      <TestWrapper>
        <TemplateContext.Provider value={scriptTemplateContextMock}>
          <ScriptTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const changeButton = getByText('onChange Button')
    act(() => {
      fireEvent.click(changeButton as HTMLElement)
    })
    expect(scriptTemplateContextMock.updateTemplate).toBeCalledWith({
      name: 'Test Template Secret Manager',
      identifier: 'Test_Template_SM',
      versionLabel: 'v1',
      type: 'SecretManager',
      projectIdentifier: 'Yogesh_Test',
      orgIdentifier: 'default',
      tags: {},
      spec: {
        shell: 'Bash',
        source: {
          spec: {
            script: 'echo hi',
            type: 'Inline'
          }
        },
        onDelegate: true,
        environmentVariables: [{ name: 'key', type: 'String', value: 1 }],
        variables: undefined,
        outputVariables: undefined,
        executionTarget: {
          connectorRef: undefined
        }
      }
    })
  })

  test('should call updateTemplate with correctly when form is updated with execution target', async () => {
    scriptTemplateContextMock.state.template = { ...secretManagerTemplateMock, spec: undefined }
    scriptTemplateContextMockWrapper.testData = secretManagerTemplateMockWithExecutionTarget
    const { getByText } = render(
      <TestWrapper>
        <TemplateContext.Provider value={scriptTemplateContextMock}>
          <ScriptTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const changeButton = getByText('onChange Button')
    act(() => {
      fireEvent.click(changeButton as HTMLElement)
    })
    expect(scriptTemplateContextMock.updateTemplate).toBeCalledWith({
      name: 'Test Template Secret Manager',
      identifier: 'Test_Template_SM',
      versionLabel: 'v1',
      type: 'SecretManager',
      projectIdentifier: 'Yogesh_Test',
      orgIdentifier: 'default',
      tags: {},
      spec: {
        shell: 'Bash',
        source: {
          spec: {
            script: 'echo hi',
            type: 'Inline'
          }
        },
        onDelegate: false,
        environmentVariables: undefined,
        outputVariables: [{ name: 'key', type: 'String', value: 1 }],
        executionTarget: {
          connectorRef: 'acc.connectorId',
          host: 'host',
          workingDirectory: 'workingdirectory'
        }
      }
    })
  })

  test('should match snapshot for default scriptTemplateContextMock', async () => {
    scriptTemplateContextMock.state.template = secretManagerTemplateMock
    scriptTemplateContextMock.state.originalTemplate = secretManagerTemplateMock
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={scriptTemplateContextMock}>
          <ScriptTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
