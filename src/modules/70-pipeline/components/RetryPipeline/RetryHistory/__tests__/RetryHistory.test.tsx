/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as usePermission from '@rbac/hooks/usePermission'
import * as pipelineng from 'services/pipeline-ng'
import * as ExecutionContext from '@pipeline/context/ExecutionContext'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { ExecutionHeader } from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionHeader/ExecutionHeader'
import { mockLatestExecutionId, mockRetryHistory } from './mocks'

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: jest.fn().mockReturnValue({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: {
        showRetryHistory: true,
        canRetry: true
      }
    }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useHandleInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useHandleStageInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useGetExecutionData: jest.fn().mockReturnValue({}),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useRetryHistory: jest.fn(() => mockRetryHistory),
  useLatestExecutionId: jest.fn(() => mockLatestExecutionId)
}))

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showPrimary: jest.fn()
  }),
  useConfirmationDialog: jest.fn().mockImplementation(async ({ onCloseDialog }) => {
    await onCloseDialog(true)
  })
}))

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  source: 'executions'
}

describe('Retry History Button tests', () => {
  test('retry history button should be disabled when view pipeline permission is falsy', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [false, false, false])
    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionHeader />
      </TestWrapper>
    )
    const retryHistoryButton = await screen.findByRole('button', {
      name: 'pipeline.retryHistory'
    })
    expect(retryHistoryButton).toBeDisabled()
  })

  test('retry history button should be enabled when view pipeline permission is truthy', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true, true, false])
    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionHeader />
      </TestWrapper>
    )
    const retryHistoryButton = await screen.findByRole('button', {
      name: 'pipeline.retryHistory'
    })
    expect(retryHistoryButton).not.toBeDisabled()
    userEvent.click(retryHistoryButton)
    const retryHistoryExecutionList = await screen.findByTestId('retryHistoryExecutionList')
    expect(retryHistoryExecutionList).toMatchSnapshot('RetryHistoryExecutionList Snapshot')
    const executionDetailText = await screen.findByText('pipeline.recentExecutionText 2/2')
    userEvent.click(executionDetailText)
    expect(mockHistoryPush).toBeCalledWith(
      '/account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/pWoxb6ZARgCrf2fYtZ4k5Q/pipeline'
    )
  })

  test('render retry history execution list on loading state', async () => {
    jest.spyOn(pipelineng, 'useRetryHistory').mockImplementation((): any => {
      return { data: {}, refetch: jest.fn(), loading: true }
    })
    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionHeader />
      </TestWrapper>
    )
    const retryHistoryButton = await screen.findByRole('button', {
      name: 'pipeline.retryHistory'
    })
    userEvent.click(retryHistoryButton)
    const retryHistoryExecutionList = await screen.findByTestId('retryHistoryExecutionList')
    expect(retryHistoryExecutionList).toMatchSnapshot('RetryHistoryExecutionList Loading')
    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('on viewLatest click', async () => {
    jest.spyOn(ExecutionContext, 'useExecutionContext').mockReturnValue({
      pipelineExecutionDetail: {
        pipelineExecutionSummary: {
          showRetryHistory: true,
          canRetry: false
        }
      }
    } as any)
    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionHeader />
      </TestWrapper>
    )
    const viewLatestText = await screen.findByText('common.viewLatest')
    userEvent.click(viewLatestText)
    expect(mockHistoryPush).toBeCalledWith(
      '/account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/pWoxb6ZARgCrf2fYtZ4k5Q/pipeline'
    )
  })
})
