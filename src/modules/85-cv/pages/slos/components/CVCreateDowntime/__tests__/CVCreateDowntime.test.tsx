/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { editParams } from '@cv/utils/routeUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { cvModuleParams } from '@cv/RouteDestinations'
import CVCreateDowntime from '../CVCreateDowntime'
import {
  downtimeAssociatedMSs,
  oneTimeDurationBasedDowntimeResponse,
  oneTimeEndTimeBasedDowntimeResponse,
  recurrenceBasedDowntimeResponse
} from './CVCreateDowntime.mock'
import { getSLOTitle } from '../CVCreateDowntime.utils'

const testPath = routes.toCVEditSLODowntime({
  ...accountPathProps,
  ...projectPathProps,
  ...cvModuleParams,
  ...editParams
})
const testPathParams = {
  accountId: 'dummy',
  orgIdentifier: 'dummy',
  projectIdentifier: 'dummy',
  identifier: 'dummy',
  module: 'cv'
}

jest.mock(
  '@cv/pages/slos/components/CVCreateDowntime/components/CreateDowntimeForm/components/AddMonitoredServices/components/MSList.tsx',
  () => ({
    __esModule: true,
    default: function MSList() {
      return <div data-testid="MS-List" />
    }
  })
)

jest.mock('services/cv', () => ({
  useGetAssociatedMonitoredServices: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    data: downtimeAssociatedMSs,
    refetch: jest.fn()
  })),
  useSaveDowntime: jest.fn().mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() }),
  useUpdateDowntimeData: jest.fn().mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() }),
  useGetDowntime: jest.fn().mockReturnValue({ data: {}, loading: false, error: null, refetch: jest.fn() })
}))

describe('CVCreateDowntime', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render create flow', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CVCreateDowntime />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('cv.sloDowntime.createSLODowntime')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.steps.identification')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.steps.downtimeWindow')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.steps.monitoredServices')).toBeInTheDocument()
      expect(getByText('cancel')).toBeInTheDocument()
      expect(getByText('save')).toBeInTheDocument()
    })

    expect(container).toMatchSnapshot()

    act(() => {
      userEvent.click(getByText('next'))
    })
  })

  test('should render validations for all steps', async () => {
    const createDowntime = jest.fn()
    jest
      .spyOn(cvServices, 'useSaveDowntime')
      .mockReturnValue({ data: oneTimeDurationBasedDowntimeResponse, mutate: createDowntime } as any)
    jest.spyOn(cvServices, 'useGetAssociatedMonitoredServices').mockReturnValue({
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)

    const { getByText, getAllByText, getByPlaceholderText } = render(
      <TestWrapper>
        <CVCreateDowntime />
      </TestWrapper>
    )

    userEvent.click(getByText('next'))

    await waitFor(() => {
      expect(getAllByText('cv.sloDowntime.validations.nameValidation')).toHaveLength(2)
      expect(getAllByText('cv.sloDowntime.validations.categoryValidation')).toHaveLength(2)
    })

    act(() => {
      fireEvent.change(getByPlaceholderText('common.namePlaceholder')!, { target: { value: 'Weekly downtime' } })
      userEvent.click(getByText('cv.sloDowntime.scheduledMaintenance'))
    })

    userEvent.click(getByText('next'))

    await waitFor(() => {
      expect(getByText('common.occurrence.oneTime')).toBeInTheDocument()
      expect(getByText('common.occurrence.recurring')).toBeInTheDocument()
      expect(getByText('Timezone')).toBeInTheDocument()
      expect(getByText('pipeline.startTime')).toBeInTheDocument()
      expect(getByText('cv.dateAndTimeLabel')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.durationText')).toBeInTheDocument()
    })

    userEvent.click(getByText('next'))

    await waitFor(() => {
      expect(getByText('cv.sloDowntime.selectMonitoredServices')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.selectAllMonitoredServices')).toBeInTheDocument()
    })

    userEvent.click(getByText('save'))

    await waitFor(() => {
      expect(getByText('cv.sloDowntime.validations.msListValidation')).toBeInTheDocument()
    })
  })

  test('should render error on edit page', async () => {
    jest.spyOn(cvServices, 'useGetDowntime').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { data: { message: 'Oops, something went wrong on our end. Please contact Harness Support.' } },
          loading: false
        } as any)
    )
    jest.spyOn(cvServices, 'useGetAssociatedMonitoredServices').mockImplementationOnce(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { data: { message: 'Oops, something went wrong on our end. Please contact Harness Support.' } },
          loading: false
        } as any)
    )

    const { getByText } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateDowntime />
      </TestWrapper>
    )

    expect(getByText('Oops, something went wrong on our end. Please contact Harness Support.')).toBeInTheDocument()

    act(() => {
      userEvent.click(getByText('Retry'))
    })
  })

  test('should render one time end time based downtime data on edit page', async () => {
    const updateDowntime = jest.fn()
    jest.spyOn(cvServices, 'useGetDowntime').mockImplementation(
      () =>
        ({
          data: oneTimeEndTimeBasedDowntimeResponse,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    jest.spyOn(cvServices, 'useGetAssociatedMonitoredServices').mockReturnValue({
      data: downtimeAssociatedMSs,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
    jest
      .spyOn(cvServices, 'useUpdateDowntimeData')
      .mockReturnValue({ data: oneTimeEndTimeBasedDowntimeResponse, mutate: updateDowntime } as any)

    const { container, getByText } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateDowntime />
      </TestWrapper>
    )

    expect(screen.getByDisplayValue('SLO Downtime')).toBeInTheDocument()
    expect(getByText('SLO_Downtime')).toBeInTheDocument()
    expect(getByText('Weekly downtime')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Deployment')).toBeInTheDocument()

    act(() => {
      userEvent.click(getByText('next'))
    })

    expect(getByText('Asia/Calcutta')).toBeInTheDocument()
    expect(getByText('cv.dateAndTimeLabel')).toBeInTheDocument()
    expect(getByText('pipeline.startTime')).toBeInTheDocument()
    expect(getByText('common.endTime')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.durationText')).toBeInTheDocument()

    await act(() => {
      userEvent.click(getByText('next'))
    })

    expect(getByText('cv.sloDowntime.msList')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.selectMonitoredServices')).toBeInTheDocument()

    expect(container).toMatchSnapshot()

    act(() => {
      userEvent.click(getByText('save'))
      waitFor(() => expect(getByText('cv.sloDowntime.downtimeUpdated')).toBeInTheDocument())
    })
  })

  test('should render one time duration based downtime data on edit page', async () => {
    const updateDowntime = jest.fn()
    jest.spyOn(cvServices, 'useGetDowntime').mockImplementation(
      () =>
        ({
          data: oneTimeDurationBasedDowntimeResponse,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    jest
      .spyOn(cvServices, 'useUpdateDowntimeData')
      .mockReturnValue({ data: oneTimeDurationBasedDowntimeResponse, mutate: updateDowntime } as any)

    const { getByText } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateDowntime />
      </TestWrapper>
    )

    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
    expect(getByText('test')).toBeInTheDocument()
    expect(getByText('First downtime')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Deployment')).toBeInTheDocument()

    act(() => {
      userEvent.click(screen.getByText('save'))
    })
  })

  test('should render recurring downtime data on edit page', async () => {
    jest.spyOn(cvServices, 'useGetDowntime').mockReturnValue({
      data: recurrenceBasedDowntimeResponse,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)

    const { getByText, getByTestId } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateDowntime />
      </TestWrapper>
    )

    expect(screen.getByDisplayValue('test2')).toBeInTheDocument()
    expect(getByText('test2')).toBeInTheDocument()
    expect(getByText('Recurring downtime')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ScheduledMaintenance')).toBeInTheDocument()

    await act(() => {
      userEvent.click(getByTestId(/nextButton/i))
    })

    expect(getByText('Asia/Bangkok')).toBeInTheDocument()
    expect(getByText('cv.dateAndTimeLabel')).toBeInTheDocument()
    expect(getByText('pipeline.startTime')).toBeInTheDocument()
    expect(getByText('pipeline.duration')).toBeInTheDocument()
    expect(screen.getByDisplayValue('cv.minutes')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.repeatEvery')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.repeatEndsOn')).toBeInTheDocument()
  })

  test('should return slo title', () => {
    expect(getSLOTitle(str => str)).toEqual('cv.sloDowntime.createSLODowntime')
    expect(getSLOTitle(str => str, 'slo1')).toEqual('cv.sloDowntime.editSLODowntime')
    expect(getSLOTitle(str => str, undefined)).toEqual('cv.sloDowntime.createSLODowntime')
  })
})
