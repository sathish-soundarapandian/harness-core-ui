/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, getByText as getByTextGlobalFn } from '@testing-library/react'
import {
  useGetHarnessApprovalInstanceAuthorization,
  useGetApprovalInstance,
  ResponseApprovalInstanceResponse,
  ResponseHarnessApprovalInstanceAuthorization
} from 'services/pipeline-ng'
import { TestWrapper, UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import { HarnessApprovalLogsView } from '../HarnessApprovalView/HarnessApprovalLogsView'
import { mockAuthData, mockAuthDataAuthFalse, mockApprovalData } from './mock'

jest.mock('services/pipeline-ng', () => ({
  useGetHarnessApprovalInstanceAuthorization: jest.fn(),
  useGetApprovalInstance: jest.fn(),
  useAddHarnessApprovalActivity: jest.fn(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/logs', () => ({
  useGetToken: jest.fn(() => ({})),
  logBlobPromise: jest.fn(() => Promise.resolve({}))
}))

const mockData = (
  approvalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse>,
  authData: UseGetMockDataWithMutateAndRefetch<ResponseHarnessApprovalInstanceAuthorization>
) => {
  // eslint-disable-next-line
  // @ts-ignore
  useGetApprovalInstance.mockImplementation(() => approvalData)
  // eslint-disable-next-line
  // @ts-ignore
  useGetHarnessApprovalInstanceAuthorization.mockImplementation(() => authData)
}

describe('HarnessApprovalLogsView - Loading', () => {
  test('No spinner in case of Loading - missing approvalInstanceId', () => {
    mockData(mockApprovalData, mockAuthData)
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <HarnessApprovalLogsView
          step={{
            status: 'ResourceWaiting',
            executableResponses: [{ async: { callbackIds: [''] } }]
          }}
        />
      </TestWrapper>
    )
    expect(() => getByText('pipeline.approvalStage.approvalStageLogsViewMessage')).toThrow()
    expect(() => getByText('approvalStage.title')).toThrow()
    expect(getByText('common.logs.noLogsText')).toBeDefined()
    const node = getByTestId('harnessApprovalLogsTest')
    expect(node).toMatchSnapshot('Loading State - missing approvalInstanceId')
  })
})

describe('HarnessApprovalLogsView - Success', () => {
  test('Render proper in case of successful API, waiting and auth=true', async () => {
    mockData(mockApprovalData, mockAuthData)
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <HarnessApprovalLogsView
          step={{
            status: 'ResourceWaiting',
            executableResponses: [{ async: { callbackIds: ['approvalInstanceId'] } }]
          }}
        />
      </TestWrapper>
    )
    expect(getByText('execution.consoleLogs')).toBeDefined()
    expect(getByText('pipeline.approvalStage.approvalStageLogsViewMessage')).toBeDefined()
    expect(getByText('approvalStage.title')).toBeDefined()
    expect(getByText('common.logs.noLogsText')).toBeDefined()
    const node = getByTestId('harnessApprovalLogsTest')
    expect(node).toMatchSnapshot()

    const approvalButton = getByTestId('approvalButton')
    expect(approvalButton).toBeDefined()
    await act(async () => {
      fireEvent.click(approvalButton)
    })
    const modal = document.getElementsByClassName('bp3-dialog approveRejectModal')[0]
    expect(modal).toMatchSnapshot('approvalForm')
    expect(getByTextGlobalFn(modal as HTMLElement, 'pipeline.approvalStep.execution.inputsTitle')).toBeDefined()
    expect(getByTextGlobalFn(modal as HTMLElement, 'Comments')).toBeDefined()

    // Approve and Reject Buttons
    const approveButton = getByTextGlobalFn(modal as HTMLElement, 'common.approve')
    expect(approveButton).toBeDefined()
    expect(getByTextGlobalFn(modal as HTMLElement, 'common.reject')).toBeDefined()

    // Close Approval Form - Modal node should be empty
    await act(async () => {
      fireEvent.click(approveButton)
    })
    expect(document.getElementsByClassName('bp3-dialog approveRejectModal')[0]).toMatchInlineSnapshot(`undefined`)
  })
  test('Render proper in case of successful API, waiting and auth=false', async () => {
    mockData(mockApprovalData, mockAuthDataAuthFalse)
    const { getByText, container } = render(
      <TestWrapper>
        <HarnessApprovalLogsView
          step={{
            status: 'ResourceWaiting',
            executableResponses: [{ async: { callbackIds: ['approvalInstanceId'] } }]
          }}
        />
      </TestWrapper>
    )
    expect(getByText('User is not authorised')).toBeDefined()
    expect(() => getByText('approvalStage.title')).toThrow()
    expect(getByText('common.logs.noLogsText')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
