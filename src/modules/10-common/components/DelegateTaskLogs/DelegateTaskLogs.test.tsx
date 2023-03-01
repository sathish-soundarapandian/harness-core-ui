import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import DelegateTaskLogs from './DelegateTaskLogs'
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
        endTime: 0,
        orgId: 'orgIdentifier',
        pageSize: 1000,
        pageToken: 'testNextPage',
        projectId: 'projectIdentifier',
        startTime: 0,
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
        endTime: 0,
        orgId: 'orgIdentifier',
        pageSize: 1000,
        pageToken: '',
        projectId: 'projectIdentifier',
        startTime: 0,
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
        />
      </TestWrapper>
    )

    expect(getAllByRole('columnheader')).toHaveLength(5)
  })
})
