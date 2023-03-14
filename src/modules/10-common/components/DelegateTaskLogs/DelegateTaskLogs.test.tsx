/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import DelegateTaskLogs, { TaskContext } from './DelegateTaskLogs'
import mockData from './jsonpayload.json'

const refetchLogs = jest.fn()
jest.mock('services/portal', () => ({
  useGetTasksLog: jest.fn(() => ({ loading: false, data: mockData, refetch: refetchLogs }))
}))

describe('Delegate Task Logs Modal', () => {
  test('should render correctly', () => {
    const { getAllByRole, getByTestId } = render(
      <TestWrapper
        path={routes.toExecution({
          accountId: ':accountId',
          orgIdentifier: ':orgIdentifier',
          projectIdentifier: ':projectIdentifier',
          pipelineIdentifier: ':pipelineIdentifier',
          executionIdentifier: ':executionIdentifier',
          source: 'executions'
        })}
        pathParams={{
          accountId: 'accountId',
          orgIdentifier: 'orgIdentifier',
          projectIdentifier: 'projectIdentifier',
          pipelineIdentifier: 'pipelineIdentifier',
          executionIdentifier: 'executionIdentifier'
        }}
      >
        <DelegateTaskLogs
          step={{ startTs: 123, endTs: 456, name: 'step name', delegateInfoList: [{ taskId: 'abc' }] }}
          telemetry={{
            taskContext: TaskContext.PipelineStep,
            hasError: false
          }}
        />
      </TestWrapper>
    )

    expect(getAllByRole('row')).toHaveLength(mockData.resource.content.length + 1)

    act(() => {
      const firstRowExpander = getByTestId('expand-row-0')
      fireEvent.click(firstRowExpander)
    })

    expect(getAllByRole('columnheader')).toHaveLength(4)
    expect(getByTestId('row-content-0')).toBeDefined()

    const nextButton = getByTestId('button-next')
    expect(nextButton).toBeEnabled()
    act(() => {
      fireEvent.click(nextButton)
    })

    expect(refetchLogs).toHaveBeenCalledWith({
      queryParams: {
        accountId: 'accountId',
        endTime: 300,
        orgId: 'orgIdentifier',
        pageSize: 100,
        pageToken: 'testNextPage',
        projectId: 'projectIdentifier',
        startTime: -300,
        taskIds: ['abc']
      }
    })

    const prevButton = getByTestId('button-previous')
    expect(prevButton).toBeEnabled()

    refetchLogs.mockReset()

    act(() => {
      fireEvent.click(prevButton)
    })

    expect(refetchLogs).toHaveBeenCalledWith({
      queryParams: {
        accountId: 'accountId',
        endTime: 300,
        orgId: 'orgIdentifier',
        pageSize: 100,
        pageToken: '',
        projectId: 'projectIdentifier',
        startTime: -300,
        taskIds: ['abc']
      }
    })
  })

  test('should add a column for multiple taskids', () => {
    const { getAllByRole } = render(
      <TestWrapper
        path={routes.toExecution({
          accountId: ':accountId',
          orgIdentifier: ':orgIdentifier',
          projectIdentifier: ':projectIdentifier',
          pipelineIdentifier: ':pipelineIdentifier',
          executionIdentifier: ':executionIdentifier',
          source: 'executions'
        })}
        pathParams={{
          accountId: 'accountId',
          orgIdentifier: 'orgIdentifier',
          projectIdentifier: 'projectIdentifier',
          pipelineIdentifier: 'pipelineIdentifier',
          executionIdentifier: 'executionIdentifier'
        }}
      >
        <DelegateTaskLogs
          step={{
            startTs: 123,
            endTs: 456,
            name: 'step name',
            delegateInfoList: [{ taskId: 'abc' }, { taskId: 'qwe' }]
          }}
          telemetry={{
            taskContext: TaskContext.PipelineStep,
            hasError: false
          }}
        />
      </TestWrapper>
    )

    expect(getAllByRole('columnheader')).toHaveLength(5)
  })
})
