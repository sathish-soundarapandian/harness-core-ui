/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { useGetApprovalInstance } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { CustomApprovalView } from '../CustomApprovalView/CustomApprovalView'
import { mockCustomApprovalDataLoading, mockCustomApprovalData, mockCustomApprovalDataError } from './mock'

jest.mock('services/pipeline-ng', () => ({
  useGetApprovalInstance: jest.fn()
}))

describe('LOADING', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetApprovalInstance.mockImplementation(() => mockCustomApprovalDataLoading)
  })

  test('show spinner in loading state', () => {
    const { container } = render(<CustomApprovalView step={{}} />)

    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeTruthy()
  })
})

describe('SUCCESS', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetApprovalInstance.mockImplementation(() => mockCustomApprovalData)
  })
  test('show tabs when data is present and authorized', async () => {
    const { container, getByText, rerender } = render(
      <TestWrapper>
        <CustomApprovalView
          step={{
            status: 'ResourceWaiting',
            // eslint-disable-next-line
            // @ts-ignore
            executableResponses: [{ async: { callbackIds: ['approvalInstanceId'] } }]
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('jira approval execution view')

    act(() => {
      fireEvent.click(getByText('common.refresh'))
    })
    await waitFor(() => expect(mockCustomApprovalData.refetch).toBeCalled())

    rerender(
      <TestWrapper>
        <CustomApprovalView
          step={{
            status: 'Aborted'
          }}
        />
      </TestWrapper>
    )
  })

  test('show spinner when approvalInstanceId is absent', async () => {
    const { container } = render(
      <TestWrapper>
        <CustomApprovalView
          step={{
            status: 'ResourceWaiting'
          }}
        />
      </TestWrapper>
    )

    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeTruthy()
  })
})

describe('ERROR', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetApprovalInstance.mockImplementation(() => mockCustomApprovalDataError)
  })

  test('show tabs when data is present and authorized', async () => {
    const { container } = render(
      <TestWrapper>
        <CustomApprovalView step={{}} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.bp3-icon-error')).toBeTruthy())
  })
})
