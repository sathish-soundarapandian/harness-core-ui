/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CDLicenseType } from '@common/constants/SubscriptionTypes'
import { useMutateAsGet } from '@common/hooks'
import serviceInstanceApiResponse from './mocks/serviceInstanceApiResponse.json'
import { ServiceLicenseGraphs } from '../overview/ServiceLicenseGraphs'

jest.mock('services/cd-ng')
jest.mock('highcharts-react-official', () => () => <div />)
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: serviceInstanceApiResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Service License Visualisation Graph test cases', () => {
  test('it renders the subscriptions page with SI graph', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2023-05-19'))
    const { container } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('changing dropdown selection', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()

    //click again and select other option
    act(() => {
      fireEvent.click(filterDropdown)
    })
    act(() => {
      fireEvent.click(document.querySelector('ul')!.childNodes[0])
    })
    expect(useMutateAsGet).toBeCalled()
    //click again and select other option
    act(() => {
      fireEvent.click(filterDropdown)
    })
    act(() => {
      fireEvent.click(document.querySelector('ul')!.childNodes[1])
    })
    expect(useMutateAsGet).toBeCalled()
  })
  test('changing dropdown selection using fake timers if current month is january', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-01-19'))
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('changing dropdown selection using fake timers if current month is february', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-10-19'))
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()
  })
  test('changing dropdown selection using fake timers if current month is february', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-02-19'))
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()
  })
  test('changing dropdown selection using fake timers if current month is february', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-10-19'))
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()
  })
  test('changing dropdown selection using fake timers if current month is October', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-02-19'))
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()
  })
  test('changing dropdown selection when current month is October', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )

    const filterDropdown = document.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement

    // click the dropdown
    act(() => {
      fireEvent.click(filterDropdown)
    })
    await waitFor(() => {
      expect(getByText('Last 12 Months')).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(getByText('Last 12 Months'))
    })
    expect(useMutateAsGet).toBeCalled()

    //click again and select other option
    act(() => {
      fireEvent.click(filterDropdown)
    })
    act(() => {
      fireEvent.click(document.querySelector('ul')!.childNodes[0])
    })
    expect(useMutateAsGet).toBeCalled()
    //click again and select other option
    act(() => {
      fireEvent.click(filterDropdown)
    })
    act(() => {
      fireEvent.click(document.querySelector('ul')!.childNodes[1])
    })
    expect(useMutateAsGet).toBeCalled()
  })
})

describe('Service License Visualisation Graph test cases for api data still loading', () => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(new Date('2023-05-19'))
  test('checking if spinner loads on loading as true from api ', async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: [], refetch: jest.fn(), error: null, loading: true }
    })
    const { container } = render(
      <TestWrapper>
        <ServiceLicenseGraphs accountId={'accountId'} licenseType={CDLicenseType.SERVICE_INSTANCES} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot('spinner')
  })
})
