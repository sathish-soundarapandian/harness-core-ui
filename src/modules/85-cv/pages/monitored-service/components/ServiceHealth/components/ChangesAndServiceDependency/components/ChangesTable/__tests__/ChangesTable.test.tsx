/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { mockData, mockPaginatedData } from './ChangeTable.mock'
import ChangesTable from '../ChangesTable'

jest.mock('services/cv', () => ({
  useChangeEventList: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('Change table', () => {
  test('should render with no data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoredServices.noAvailableData')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })
  test('should render with loading state', async () => {
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { message: '' },
          loading: true
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render with error state', async () => {
    const refetch = jest.fn()
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: null,
          refetch,
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeTruthy()
    )
    act(() => {
      fireEvent.click(getByText('Retry'))
    })

    await waitFor(() =>
      expect(cvService.useChangeEventList).toHaveBeenLastCalledWith({
        lazy: true,
        accountIdentifier: undefined,
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        queryParams: {
          endTime: 1,
          envIdentifiers: ['env'],
          pageIndex: 0,
          pageSize: 10,
          serviceIdentifiers: ['srv'],
          startTime: 0,
          changeSourceTypes: [],
          changeCategories: []
        },
        queryParamStringifyOptions: { arrayFormat: 'repeat' }
      })
    )

    expect(container).toMatchSnapshot()
  })
  test('should verify pagination', async () => {
    const refetchChangeList = jest.fn()
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: mockPaginatedData,
          refetch: refetchChangeList,
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={1}
          endTime={2}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )

    // verify pagination
    const pageButtons = container.querySelectorAll('[class*="Pagination--roundedButton"]')
    act(() => {
      fireEvent.click(pageButtons[2])
    })

    userEvent.click(pageButtons[2])

    await waitFor(() =>
      expect(refetchChangeList).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        },
        queryParams: {
          endTime: 2,
          envIdentifiers: ['env'],
          pageIndex: 1,
          pageSize: 10,
          serviceIdentifiers: ['srv'],
          startTime: 1,
          // Need to remove once these made as optional from BE
          changeCategories: [],
          changeSourceTypes: []
        }
      })
    )
  })

  test('should verify changetable rendering with data', async () => {
    const refetchChangeList = jest.fn()
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: mockData,
          refetch: refetchChangeList,
          error: null,
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={1}
          endTime={2}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    // verify row renders
    await waitFor(() =>
      expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(mockData.resource.content.length)
    )
    // verify changesource name
    await waitFor(() => expect(getByText('Demo Test PD')).toBeTruthy())
    await waitFor(() => expect(getByText('Kubernetes Deployment event')).toBeTruthy())
    await waitFor(() => expect(getByText('Deployment of manager in prod HarnessCD')).toBeTruthy())
    await waitFor(() => expect(getByText('Deployment of manager in prod HarnessCDNextGen')).toBeTruthy())

    // verify types column
    await waitFor(() => expect(getByText('HarnessCD')).toBeTruthy())
    await waitFor(() => expect(getByText('HarnessCDNextGen')).toBeTruthy())
    await waitFor(() => expect(getByText('PagerDuty')).toBeTruthy())
    await waitFor(() => expect(getByText('K8sCluster')).toBeTruthy())

    // verify count on table title
    await waitFor(() => expect(getByText('changes(4)')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('should verify container should not be a Card', () => {
    const { container } = render(
      <TestWrapper>
        <ChangesTable
          isCardView={false}
          hasChangeSource
          startTime={1}
          endTime={2}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )

    expect(container.querySelector('.bp3-card')).not.toBeInTheDocument()
  })
})
