/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, queryByText, waitFor, screen } from '@testing-library/react'
import * as cvService from 'services/cv'
import routes from '@common/RouteDefinitions'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { monitoredService } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.mock'
import { SummaryCard } from '../components/MonitoredServiceGraphView/views/SummaryCard'
import {
  testWrapperProps,
  pathParams,
  errorMessage,
  servicePoint
} from '../components/MonitoredServiceGraphView/__tests__/ServiceDependencyGraph.mock'
import { MonitoredServiceEnum } from '../../MonitoredServicePage.constants'

const onToggleService = jest.fn()
const onDeleteService = jest.fn()

jest.mock('services/cv', () => ({
  useGetMonitoredServiceDetailsWithServiceId: jest
    .fn()
    .mockImplementation(() => ({ data: monitoredService, refetch: jest.fn() }))
}))

describe('Monitored Service Summary Card', () => {
  test('Service data available', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SummaryCard onToggleService={onToggleService} onDeleteService={onDeleteService} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('onEditService', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SummaryCard onToggleService={onToggleService} onDeleteService={onDeleteService} />
      </TestWrapper>
    )

    await userEvent.click(container.querySelector('[data-icon="Edit"]')!)

    await waitFor(() =>
      expect(
        screen.getByText(
          routes.toCVAddMonitoringServicesEdit({ ...pathParams, identifier: 'identifier', module: 'cv' }) +
            getCVMonitoringServicesSearchParam({ tab: MonitoredServiceEnum.Configurations })
        )
      ).toBeInTheDocument()
    )
  })

  test('onDeleteService', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SummaryCard onToggleService={onToggleService} onDeleteService={onDeleteService} />
      </TestWrapper>
    )

    await userEvent.click(container.querySelector('[data-icon="trash"]')!)

    await waitFor(() => screen.queryByText('yes'))

    const confirmDialog = findDialogContainer()

    expect(confirmDialog).toBeInTheDocument()

    await userEvent.click(queryByText(confirmDialog!, 'yes')!)

    expect(onDeleteService).toBeCalledWith(monitoredService.identifier)
  })

  test('onToggleService', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SummaryCard onToggleService={onToggleService} onDeleteService={onDeleteService} />
      </TestWrapper>
    )

    await userEvent.click(container.querySelector('[data-name="on-btn"]')!)

    expect(onToggleService).toHaveBeenCalledWith(monitoredService.identifier, true)
  })

  test('Loading', () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceDetailsWithServiceId')
      .mockReturnValue({ loading: true, refetch: jest.fn() } as any)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SummaryCard onToggleService={onToggleService} onDeleteService={onDeleteService} />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('Error', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServiceDetailsWithServiceId')
      .mockReturnValue({ error: { message: errorMessage }, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <SummaryCard onToggleService={onToggleService} onDeleteService={onDeleteService} point={servicePoint} />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByText('Retry'))

    await waitFor(() =>
      expect(cvService.useGetMonitoredServiceDetailsWithServiceId).toHaveBeenLastCalledWith({
        monitoredServiceIdentifier: servicePoint.monitoredServiceIdentifier,
        queryParams: pathParams
      })
    )
  })
})
