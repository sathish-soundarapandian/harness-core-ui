/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, within } from '@testing-library/react'
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
          taskList={[]}
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

  test('should add a column for multiple taskids when step.delegateInfoList IS NOT empty and taskList IS empty', () => {
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
          taskList={[]}
          telemetry={{
            taskContext: TaskContext.PipelineStep,
            hasError: false
          }}
        />
      </TestWrapper>
    )

    expect(getAllByRole('columnheader')).toHaveLength(5)
  })

  test('should render fine for multiple taskids when step.delegateInfoList IS empty and taskList IS NOT empty', () => {
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
            delegateInfoList: []
          }}
          taskList={[
            { taskId: 'abc123', taskName: 'Artifact Task: artifact' },
            { taskId: 'def456', taskName: 'Config Task: config' }
          ]}
          telemetry={{
            taskContext: TaskContext.PipelineStep,
            hasError: false
          }}
        />
      </TestWrapper>
    )

    expect(getAllByRole('columnheader')).toHaveLength(5)
    const allRows = getAllByRole('row')
    expect(allRows).toHaveLength(4)

    // Header
    const headerRow = allRows[0]
    expect(within(headerRow).getByText('Severity')).toBeInTheDocument()
    expect(within(headerRow).getByText('Time')).toBeInTheDocument()
    expect(within(headerRow).getByText('Task Id')).toBeInTheDocument()
    expect(within(headerRow).getByText('Message')).toBeInTheDocument()

    // First Row
    const firstRow = allRows[1]
    expect(within(firstRow).getByText('INFO')).toBeInTheDocument()
    expect(within(firstRow).getByText('2023-02-07T22:09:46Z')).toBeInTheDocument()
    expect(within(firstRow).getByText('KJOruTLPQfq35VaR_j5abc')).toBeInTheDocument()
    expect(
      within(firstRow).getByText('Done setting file permissions for script /tmp/harness-YHWo3eoOS0OkZzD7dPhKxg.sh')
    ).toBeInTheDocument()

    // Second Row
    const secondRow = allRows[2]
    expect(within(secondRow).getByText('ERROR')).toBeInTheDocument()
    expect(within(secondRow).getByText('2023-02-08T22:09:46Z')).toBeInTheDocument()
    expect(within(secondRow).getByText('KJOruTLPQfq35VaR_j5def')).toBeInTheDocument()
    expect(within(secondRow).getByText('Dummy error in shell script')).toBeInTheDocument()

    // Third Row
    const thirdRow = allRows[3]
    expect(within(thirdRow).getByText('INFO')).toBeInTheDocument()
    expect(within(thirdRow).getByText('2023-02-09T22:09:46Z')).toBeInTheDocument()
    expect(within(thirdRow).getByText('KJOruTLPQfq35VaR_j5ghi')).toBeInTheDocument()
    expect(
      within(thirdRow).getByText(
        'Shell script task parameters: accountId - kmpySmUISimoRrJL6NL73w, appId - null, workingDir - /tmp, activityId - YHWo3eoOS0OkZzD7dPhKxg'
      )
    ).toBeInTheDocument()
  })
})
