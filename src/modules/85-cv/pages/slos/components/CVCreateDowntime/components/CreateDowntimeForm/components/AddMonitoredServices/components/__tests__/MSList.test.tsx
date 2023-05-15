/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import MSList from '../MSList'
import { environmentDataList, monitoredServiceList, monitoredServiceListWithIncorrectData, msList } from './MSList.mock'

jest.mock('services/cv', () => ({
  useListMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ data: {}, refetch: jest.fn(), error: null, loading: false })),
  useGetMonitoredServiceListEnvironments: jest
    .fn()
    .mockImplementation(() => ({ data: environmentDataList, loading: false } as any))
}))

describe('MSlist', () => {
  test('env filter should render loading', async () => {
    jest.spyOn(cvServices, 'useGetMonitoredServiceListEnvironments').mockImplementationOnce(
      () =>
        ({
          data: null,
          loading: true
        } as any)
    )
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={[]} />
      </TestWrapper>
    )

    await act(async () => {
      const envFilter = getByPlaceholderText('- all -')
      expect(envFilter).toBeInTheDocument()
      await userEvent.click(envFilter)
    })
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    expect(getByText('loading')).toBeInTheDocument()
  })

  test('should render no data card', async () => {
    jest.spyOn(cvServices, 'useGetMonitoredServiceListEnvironments').mockImplementationOnce(
      () =>
        ({
          data: {},
          loading: false
        } as any)
    )
    const { getByText } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={[]} />
      </TestWrapper>
    )

    expect(getByText('cv.sloDowntime.NoData')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.NoDataSuggestion')).toBeInTheDocument()
  })

  test('should render error state', async () => {
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { data: { message: 'Oops, something went wrong on our end. Please contact Harness Support.' } },
          loading: false
        } as any)
    )
    jest.spyOn(cvServices, 'useGetMonitoredServiceListEnvironments').mockImplementationOnce(
      () =>
        ({
          data: { data: [{ environment: { accountId: 'kmpySmUISimoRrJL6NL73w' } }] },
          loading: false
        } as any)
    )

    const { getByText } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={[]} />
      </TestWrapper>
    )

    expect(getByText('Oops, something went wrong on our end. Please contact Harness Support.')).toBeInTheDocument()

    const retryButton = getByText('Retry')
    expect(retryButton).toBeInTheDocument()
    act(() => {
      fireEvent.click(getByText('Retry'))
    })
  })

  test('should render default values for incorrect msListItemDTO data', async () => {
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: monitoredServiceListWithIncorrectData,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )

    const { getByText } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={[]} />
      </TestWrapper>
    )

    expect(getByText('datadog-m')).toBeInTheDocument()
  })

  test('should render monitored services', async () => {
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: monitoredServiceList,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )

    const { container, getByText, getAllByText } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={msList} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    expect(getByText('cv.monitoredServices.heading'.toUpperCase())).toBeInTheDocument()
    expect(getByText('tagsLabel'.toUpperCase())).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.numberOfSLOs')).toBeInTheDocument()
    expect(getByText('filters.apply')).toBeInTheDocument()
    expect(getAllByText('newone')).toHaveLength(2)

    expect(container.querySelectorAll('[type="checkbox"]')[1]).toBeChecked()

    await act(async () => {
      await userEvent.click(container.querySelectorAll('[type="checkbox"]')[1])
      await userEvent.click(container.querySelectorAll('[type="checkbox"]')[0])
    })
    expect(container.querySelectorAll('[type="checkbox"]')[0]).toBeChecked()

    await act(async () => {
      await userEvent.click(container.querySelectorAll('[type="checkbox"]')[0])
    })
    expect(container.querySelectorAll('[type="checkbox"]')[0]).not.toBeChecked()

    await act(async () => {
      await userEvent.click(container.querySelectorAll('[type="checkbox"]')[1])
    })
    await expect(container.querySelectorAll('[type="checkbox"]')[1]).toBeChecked()

    fireEvent.click(getByText('filters.apply'))
  })

  test('should apply environment filters', async () => {
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: monitoredServiceList,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={msList} />
      </TestWrapper>
    )

    // to apply environment filter
    await act(async () => {
      const envFilter = getByPlaceholderText('- all -')
      expect(envFilter).toBeInTheDocument()
      await userEvent.click(envFilter)
    })
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    const envOption = getByText('env1234')
    expect(envOption).toBeInTheDocument()
    await userEvent.click(envOption)
  })

  test('should verify pagination', async () => {
    jest.spyOn(cvServices, 'useListMonitoredService').mockImplementation(
      () =>
        ({
          data: monitoredServiceList,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )

    const { container } = render(
      <TestWrapper>
        <MSList onAddMS={jest.fn()} hideDrawer={jest.fn()} msList={[]} />
      </TestWrapper>
    )

    const pageButtons = container.querySelectorAll('[class*="Pagination--roundedButton"]')
    expect(pageButtons[2]).toBeInTheDocument()

    fireEvent.click(pageButtons[2])
  })
})
