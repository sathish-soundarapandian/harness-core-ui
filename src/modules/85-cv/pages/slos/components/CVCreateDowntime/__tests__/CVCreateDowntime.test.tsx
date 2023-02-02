/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, screen, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { editParams } from '@cv/utils/routeUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import CVCreateDowntime from '../CVCreateDowntime'
import {
  oneTimeDurationBasedDowntimeResponse,
  oneTimeEndTimeBasedDowntimeResponse,
  recurrenceBasedDowntimeResponse
} from './CVCreateDowntime.mock'

const testPath = routes.toCVEditSLODowntime({ ...accountPathProps, ...projectPathProps, ...editParams })
const testPathParams = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', identifier: 'dummy' }

describe('CVCreateDowntime', () => {
  test('should render CVCreateDowntime and show validations', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CVCreateDowntime />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(getByText('cv.sloDowntime.addDowntime')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.steps.identification')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.steps.downtimeWindow')).toBeInTheDocument()
      expect(getByText('cv.sloDowntime.steps.monitoredServices')).toBeInTheDocument()
      expect(getByText('cancel')).toBeInTheDocument()
      expect(getByText('save')).toBeInTheDocument()
    })

    expect(container).toMatchSnapshot()
  })

  test('should render one time end time based downtime data on edit page', async () => {
    jest.spyOn(cvServices, 'useGetDowntime').mockImplementation(
      () =>
        ({
          data: oneTimeEndTimeBasedDowntimeResponse,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
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
      fireEvent.click(screen.getByText('next'))
    })

    expect(getByText('Asia/Calcutta')).toBeInTheDocument()
    expect(getByText('cv.dateAndTimeLabel')).toBeInTheDocument()
    expect(getByText('pipeline.startTime')).toBeInTheDocument()
    expect(getByText('common.endTime')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.durationText')).toBeInTheDocument()

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(screen.getByText('save'))
    })
  })

  test('should render one time duration based downtime data on edit page', async () => {
    jest.spyOn(cvServices, 'useGetDowntime').mockImplementation(
      () =>
        ({
          data: oneTimeDurationBasedDowntimeResponse,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
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
      fireEvent.click(screen.getByText('next'))
    })

    act(() => {
      fireEvent.click(screen.getByText('save'))
    })
  })

  test('should render recurring downtime data on edit page', async () => {
    jest.spyOn(cvServices, 'useGetDowntime').mockImplementation(
      () =>
        ({
          data: recurrenceBasedDowntimeResponse,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )

    const { container, getByText } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateDowntime />
      </TestWrapper>
    )

    expect(screen.getByDisplayValue('test2')).toBeInTheDocument()
    expect(getByText('test2')).toBeInTheDocument()
    expect(getByText('Recurring downtime')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ScheduledMaintenance')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByText('next'))
    })

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(screen.getByText('save'))
    })
  })
})
