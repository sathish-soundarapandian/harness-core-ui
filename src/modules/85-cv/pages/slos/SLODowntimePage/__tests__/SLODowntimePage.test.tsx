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
import type { StringKeys } from 'framework/strings'
import SLODowntimePage from '../SLODowntimePage'
import { downtimeHistoryResponse, downtimeResponse, monitoredServiceOptionsResponse } from './SLODowntimePage.mock'
import DowntimeHistory from '../components/DowntimeHistory/DowntimeHistory'
import { getDowntimeStatusLabel, getDuration, getRecurrenceType } from '../components/DowntimeList/DowntimeList.utils'
import DowntimeFilters, { onChange } from '../components/DowntimeFilters/DowntimeFilters'

function getString(key: StringKeys): StringKeys {
  return key
}

jest.mock('services/cv', () => ({
  useListDowntimes: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    data: {},
    refetch: jest.fn()
  })),
  useGetHistory: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    data: {},
    refetch: jest.fn()
  })),
  useGetDowntimeAssociatedMonitoredServices: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    data: monitoredServiceOptionsResponse,
    refetch: jest.fn()
  })),
  useDeleteDowntimeData: jest.fn().mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() }),
  useEnablesDisablesDowntime: jest.fn().mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() })
}))

describe('SLO Downtime page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render no data state', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    expect(getByText('cv.sloDowntime.noData')).toBeTruthy()
    fireEvent.click(getByText('common.learnMore'))
  })

  test('should render error in downtime list view', async () => {
    jest.spyOn(cvServices, 'useListDowntimes').mockReturnValue({
      data: null,
      refetch: jest.fn(),
      error: { data: { message: 'Oops, something went wrong on our end. Please contact Harness Support.' } },
      loading: false
    } as any)
    jest.spyOn(cvServices, 'useGetHistory').mockReturnValue({
      data: downtimeHistoryResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)

    const { getByText } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    expect(getByText('Oops, something went wrong on our end. Please contact Harness Support.')).toBeInTheDocument()

    fireEvent.click(getByText('Retry'))
  })

  test('should render downtime list view', async () => {
    jest.spyOn(cvServices, 'useListDowntimes').mockReturnValue({
      data: downtimeResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    const { getByText, container, getAllByText } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    expect(getByText('cv.slos.status')).toBeInTheDocument()
    expect(getByText('CV.SLODOWNTIME.DOWNTIMENAME')).toBeInTheDocument()
    expect(getByText('CV.SLODOWNTIME.DOWNTIMEWINDOW')).toBeInTheDocument()
    expect(getByText('PIPELINE.DURATION')).toBeInTheDocument()
    expect(getByText('CV.AFFECTEDSERVICES')).toBeInTheDocument()
    expect(getByText('CV.SLODOWNTIME.CATEGORY')).toBeInTheDocument()

    expect(getByText('all')).toBeInTheDocument()
    expect(getAllByText('30 cv.minutes')).toHaveLength(4)
    expect(getByText('newone')).toBeInTheDocument()
    expect(getByText('datadog')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.allMonitoredServices')).toBeInTheDocument()
    expect(getAllByText('deploymentText')).toHaveLength(2)

    act(() => {
      fireEvent.mouseOver(container.querySelectorAll('[class="statusIcon"]')[0])
    })

    fireEvent.click(getByText('common.history'))
  })

  test('should be able to apply filters', async () => {
    jest.spyOn(cvServices, 'useGetDowntimeAssociatedMonitoredServices').mockReturnValue({
      data: monitoredServiceOptionsResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    jest.spyOn(cvServices, 'useListDowntimes').mockReturnValue({
      data: downtimeResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)

    const { getByText, container } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    await act(() => {
      const msFilter = container.querySelector('[data-icon="chevron-down"]')
      expect(msFilter).toBeInTheDocument()
      fireEvent.click(msFilter!)
    })

    waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())

    act(() => {
      userEvent.click(getByText('demoservice_demoenv'))
    })

    const clearFilters = getByText('common.filters.clearFilter')
    await expect(clearFilters).toBeDefined()
    expect(clearFilters).toBeInTheDocument()

    act(() => {
      fireEvent.click(clearFilters)
    })
  })

  test('Should be able to search the downtime', async () => {
    const { container } = render(
      <TestWrapper>
        <DowntimeFilters />
      </TestWrapper>
    )

    const searchBox = container.querySelector('input[placeholder="search"]') as HTMLInputElement
    expect(searchBox).toBeInTheDocument()

    onChange('test', jest.fn(), jest.fn())
  })

  test('should toggle on/off downtime list data', async () => {
    const toggleDowntime = jest.fn()

    jest.spyOn(cvServices, 'useListDowntimes').mockReturnValue({
      data: downtimeResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    jest.spyOn(cvServices, 'useGetDowntimeAssociatedMonitoredServices').mockReturnValue({
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    jest
      .spyOn(cvServices, 'useEnablesDisablesDowntime')
      .mockReturnValue({ loading: false, mutate: toggleDowntime } as any)

    const { getByText, container } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(container.querySelectorAll('[type="checkbox"]')[0])
    })

    await expect(getByText('all')).toBeInTheDocument()

    // press add downtime button
    act(() => {
      userEvent.click(container.querySelectorAll('[class="bp3-button-text"]')[0])
    })
  })

  test('should be able to edit downtime list data', async () => {
    const deleteDowntime = jest.fn()

    jest.spyOn(cvServices, 'useListDowntimes').mockReturnValue({
      data: downtimeResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    jest.spyOn(cvServices, 'useDeleteDowntimeData').mockReturnValue({ loading: false, mutate: deleteDowntime } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    // deleting a downtime
    act(() => {
      userEvent.click(container.querySelectorAll('[data-icon="main-trash"]')[0])
    })
    await expect(getByText('delete')).toBeInTheDocument()
    fireEvent.click(getByText('delete'))

    // cancel after pressing delete icon
    act(() => {
      userEvent.click(container.querySelectorAll('[data-icon="main-trash"]')[0])
    })
    await expect(getByText('cancel')).toBeInTheDocument()
    fireEvent.click(getByText('cancel'))

    // pressing edit icon
    act(() => {
      fireEvent.click(container.querySelectorAll('[data-icon="Edit"]')[0])
    })
  })
})

describe('DowntimeHistory page', () => {
  test('should render downtime history view and change filters', async () => {
    const { getByText, container, getAllByText } = render(
      <TestWrapper>
        <DowntimeHistory
          downtimeHistoryLoading={false}
          downtimeHistoryData={downtimeHistoryResponse as any}
          refetchHistoryData={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    expect(getByText('CV.SLODOWNTIME.DOWNTIMENAME')).toBeInTheDocument()
    expect(getByText('TYPELABEL')).toBeInTheDocument()
    expect(getByText('PIPELINE.STARTTIME')).toBeInTheDocument()
    expect(getByText('COMMON.ENDTIME')).toBeInTheDocument()
    expect(getByText('PIPELINE.DURATION')).toBeInTheDocument()
    expect(getByText('CV.AFFECTEDSERVICES')).toBeInTheDocument()
    expect(getByText('CV.SLODOWNTIME.CATEGORY')).toBeInTheDocument()

    expect(getByText('one time test')).toBeInTheDocument()
    expect(getAllByText('5 cv.minutes')).toHaveLength(2)
    expect(getByText('deploymentText')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.scheduledMaintenance')).toBeInTheDocument()
  })

  test('should render no error state in downtime history view', async () => {
    const { getByText } = render(
      <TestWrapper>
        <DowntimeHistory
          downtimeHistoryLoading={false}
          downtimeHistoryData={null}
          refetchHistoryData={jest.fn()}
          downtimeHistoryError={'Oops, something went wrong on our end. Please contact Harness Support.'}
        />
      </TestWrapper>
    )

    expect(getByText('Oops, something went wrong on our end. Please contact Harness Support.')).toBeInTheDocument()

    fireEvent.click(getByText('Retry'))
  })
})

describe('DowntimeList utils', () => {
  test('getDuration should return correct values for durationValue more than 1', async () => {
    expect(getDuration(getString, { durationValue: 5, durationType: 'Weeks' })).toEqual('5 cv.weeks')
    expect(getDuration(getString, { durationValue: 5, durationType: 'Days' })).toEqual('5 cv.days')
    expect(getDuration(getString, { durationValue: 5, durationType: 'Hours' })).toEqual('5 hours')
    expect(getDuration(getString, { durationValue: 5, durationType: 'Minutes' })).toEqual('5 cv.minutes')
    expect(getDuration(getString)).toEqual('30 cv.minutes')
  })

  test('getDuration should return correct values for durationValue equal to 1', async () => {
    expect(getDuration(getString, { durationValue: 1, durationType: 'Weeks' })).toEqual('cv.sloDowntime.oneWeek')
    expect(getDuration(getString, { durationValue: 1, durationType: 'Days' })).toEqual('cv.oneDay')
    expect(getDuration(getString, { durationValue: 1, durationType: 'Hours' })).toEqual('cv.oneHour')
    expect(getDuration(getString, { durationValue: 1, durationType: 'Minutes' })).toEqual('cv.sloDowntime.oneMinute')
  })

  test('getRecurrenceType should return correct values for recurrenceValue more than 1', async () => {
    expect(getRecurrenceType({ recurrenceValue: 5, recurrenceType: 'Day' }, getString)).toEqual('5 cv.days')
    expect(getRecurrenceType({ recurrenceValue: 5, recurrenceType: 'Week' }, getString)).toEqual('5 cv.weeks')
    expect(getRecurrenceType({ recurrenceValue: 5, recurrenceType: 'Month' }, getString)).toEqual('5 cv.months')
  })

  test('getRecurrenceType should return correct values for recurrenceValue equal to 1', async () => {
    expect(getRecurrenceType({ recurrenceValue: 1, recurrenceType: 'Day' }, getString)).toEqual('cv.day')
    expect(getRecurrenceType({ recurrenceValue: 1, recurrenceType: 'Week' }, getString)).toEqual('cv.week')
    expect(getRecurrenceType({ recurrenceValue: 1, recurrenceType: 'Month' }, getString)).toEqual('cv.month')
  })

  test('getDowntimeStatusLabel should return correct values ', async () => {
    expect(getDowntimeStatusLabel(getString, 'Active')).toEqual('active')
    expect(getDowntimeStatusLabel(getString, 'Scheduled')).toEqual('triggers.scheduledLabel')
    expect(getDowntimeStatusLabel(getString)).toEqual('triggers.scheduledLabel')
  })
})
