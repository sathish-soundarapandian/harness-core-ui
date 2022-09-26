/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { VariablesInputModal } from '@pipeline/hooks/useGetCopiedTemplate/VariablesInputModal/VariablesInputModal'
import type { VariablesInputModalProps } from '@pipeline/hooks/useGetCopiedTemplate/useGetCopiedTemplate'
import type { TemplateSummaryResponse } from 'services/template-ng'
import * as templateService from 'services/template-ng'

const stepTemplate: TemplateSummaryResponse = {
  accountId: 'px7xd_BFRCi-pfWPYXVjvw',
  childType: 'Http',
  description: '',
  identifier: 'Test_Http_Template',
  lastUpdatedAt: 1637668359934,
  name: 'Test Http Template',
  orgIdentifier: 'default',
  projectIdentifier: 'Yogesh_Test',
  stableTemplate: true,
  tags: {},
  templateEntityType: 'Step',
  templateScope: 'project',
  version: 3,
  versionLabel: 'v1',
  yaml:
    'template:' +
    '\n    name: Test Http Template' +
    '\n    identifier: Test_Http_Template' +
    '\n    versionLabel: v1' +
    '\n    type: Step' +
    '\n    projectIdentifier: Yogesh_Test' +
    '\n    orgIdentifier: default' +
    '\n    description: null' +
    '\n    tags: {}' +
    '\n    spec:' +
    '\n        type: Http' +
    '\n        timeout: 1m 40s' +
    '\n        spec:' +
    '\n            url: <+input>' +
    '\n            method: GET' +
    '\n            headers: []' +
    '\n            outputVariables: []' +
    '\n            requestBody: <+input>' +
    '\n'
}

const stepMockTemplatesInputYamlMock = jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockReturnValue({
  data: {
    status: 'SUCCESS',
    data:
      'variables:\n' +
      '- name: "var1"\n' +
      '  type: "String"\n' +
      '  value: "<+input>"\n' +
      'templateInputs:\n' +
      '  type: "Http"\n' +
      '  spec:\n' +
      '    url: "<+input>"\n' +
      '    requestBody: "<+input>"\n'
  },
  refetch: jest.fn(),
  error: null,
  loading: false
} as any)
const copyTemplateWithVariablesPromiseMock = jest
  .spyOn(templateService, 'copyTemplateWithVariablesPromise')
  .mockReturnValue({
    status: 'SUCCESS',
    data:
      '---\n' +
      'name: "Http Step"\n' +
      'identifier: "Http_Step"\n' +
      'versionLabel: "v1"\n' +
      'type: "Step"\n' +
      'projectIdentifier: "prabu"\n' +
      'orgIdentifier: "default"\n' +
      'tags: {}\n' +
      'spec:\n' +
      '  type: "Http"\n' +
      '  timeout: "10s"\n' +
      '  spec:\n' +
      '    url: "<+input>"\n' +
      '    method: "GET"\n' +
      '    headers: []\n' +
      '    outputVariables: []\n' +
      '    requestBody: "<+input>"\n'
  } as any)

const baseProps: VariablesInputModalProps = {
  template: stepTemplate,
  onResolve: jest.fn(),
  onReject: jest.fn()
}

describe('<VariablesInputModal/> tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call onReject if cancel is clicked', async () => {
    const { container } = render(
      <TestWrapper>
        <VariablesInputModal {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(getByRole(container, 'button', { name: 'cancel' })!)
    })
    expect(baseProps.onReject).toBeCalled()
  })

  test('should show dialog there are template variables inputs', async () => {
    const { container } = render(
      <TestWrapper>
        <VariablesInputModal {...baseProps} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="variables[0].value"]')!, { target: { value: 'random' } })
    })

    await act(async () => {
      fireEvent.click(getByRole(container, 'button', { name: 'continue' })!)
    })

    expect(copyTemplateWithVariablesPromiseMock).toBeCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ variables: [{ name: 'var1', type: 'String', value: 'random' }] })
      })
    )

    await waitFor(() =>
      expect(baseProps.onResolve).toBeCalledWith(
        'template:\n  name: Http Step\n  identifier: Http_Step\n  versionLabel: v1\n  type: Step\n  projectIdentifier: prabu\n  orgIdentifier: default\n  tags: {}\n  spec:\n    type: Http\n    timeout: 10s\n    spec:\n      url: <+input>\n      method: GET\n      headers: []\n      outputVariables: []\n      requestBody: <+input>\n'
      )
    )
  })

  test('should call onResolve with template yaml if there are no template inputs', () => {
    stepMockTemplatesInputYamlMock.mockReturnValue({
      data: {
        status: 'SUCCESS',
        data:
          'templateInputs:' +
          '\n type: "Http"' +
          '\n spec:' +
          '\n   url: "<+input>"' +
          '\n   requestBody: "<+input>"' +
          '\n'
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    render(
      <TestWrapper>
        <VariablesInputModal {...baseProps} />
      </TestWrapper>
    )
    expect(baseProps.onResolve).toBeCalledWith(stepTemplate.yaml)
  })

  test('should call onResolve with template yaml if there are no template variables inputs', () => {
    stepMockTemplatesInputYamlMock.mockReturnValue({
      data: {
        status: 'SUCCESS',
        data: null
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    render(
      <TestWrapper>
        <VariablesInputModal {...baseProps} />
      </TestWrapper>
    )
    expect(baseProps.onResolve).toBeCalledWith(stepTemplate.yaml)
  })

  test('should call onReject if template input call fails', () => {
    stepMockTemplatesInputYamlMock.mockReturnValue({
      data: {
        status: 'SUCCESS',
        data: null
      },
      refetch: jest.fn(),
      error: 'some error',
      loading: false
    } as any)
    render(
      <TestWrapper>
        <VariablesInputModal {...baseProps} />
      </TestWrapper>
    )
    expect(baseProps.onReject).toBeCalledWith()
  })
})
