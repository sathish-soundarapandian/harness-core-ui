/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import CVSLOsListingPage from '../CVSLOsListingPage'
import type { CVSLOsListingPageProps } from '../CVSLOsListingPage.types'
import {
  testWrapperProps,
  pathParams,
  errorMessage,
  dashboardWidgetsResponse,
  dashboardWidgetsContent,
  userJourneyResponse,
  mockSLODashboardWidgetsData
} from './CVSLOsListingPage.mock'

jest.mock('@cv/pages/slos/SLOCard/SLOCardContent.tsx', () => ({
  __esModule: true,
  default: function SLOCardContent() {
    return <span data-testid="slo-card-content" />
  }
}))

const ComponentWrapper: React.FC<CVSLOsListingPageProps> = ({ monitoredService }) => {
  return (
    <TestWrapper {...testWrapperProps}>
      <CVSLOsListingPage monitoredService={monitoredService} />
    </TestWrapper>
  )
}

describe('CVSLOsListingPage', () => {
  let useGetAllJourneys: jest.SpyInstance
  let useGetSLODashboardWidgets: jest.SpyInstance
  let useDeleteSLOV2Data: jest.SpyInstance
  let refetchUserJourneys: jest.Mock
  let refetchDashboardWidgets: jest.Mock

  beforeEach(() => {
    refetchUserJourneys = jest.fn()
    refetchDashboardWidgets = jest.fn()
    useGetAllJourneys = jest.spyOn(cvServices, 'useGetAllJourneys').mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    useGetSLODashboardWidgets = jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: mockSLODashboardWidgetsData,
      loading: false,
      error: null,
      refetch: refetchDashboardWidgets
    } as any)

    jest.spyOn(cvServices, 'useGetSLOAssociatedMonitoredServices').mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    jest.spyOn(cvServices, 'useGetServiceLevelObjectivesRiskCount').mockReturnValue({
      data: {
        data: {
          riskCounts: [
            {
              displayName: 'Healthy',
              identifier: 'HEALTHY',
              count: 2
            }
          ],
          totalCount: 3
        }
      },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    useDeleteSLOV2Data = jest
      .spyOn(cvServices, 'useDeleteSLOV2Data')
      .mockReturnValue({ mutate: jest.fn(), loading: false, error: null } as any)

    jest.spyOn(cvServices, 'useResetErrorBudget').mockReturnValue({ mutate: jest.fn(), loading: false } as any)
  })

  test('Should render created SLOs and display all the fields for the created SLO', async () => {
    const { getByText, getAllByText } = render(<ComponentWrapper />)
    await waitFor(() => {
      expect(getByText('SLO-4')).toBeInTheDocument()
      expect(getByText('env_appd')).toBeInTheDocument()
      expect(getByText('service_appd')).toBeInTheDocument()
      expect(getByText('Tracks SLO error rate')).toBeInTheDocument()
      expect(getByText('Journey-3')).toBeInTheDocument()
      expect(getByText('12')).toBeInTheDocument()
      expect(getByText('43 m')).toBeInTheDocument()
      expect(getAllByText('100.00%')).toHaveLength(2)
      expect(getByText('97%')).toBeInTheDocument()
      expect(getAllByText('HEALTHY')).toHaveLength(2)
    })
  })

  test('Should render SLO Error message', async () => {
    const { getAllByTestId, getByText } = render(<ComponentWrapper />)
    await waitFor(() => {
      expect(getAllByTestId('SLOErrorIcon').length).toEqual(2)
    })
    act(() => {
      fireEvent.mouseOver(getAllByTestId('SLOErrorIcon')[0]!)
    })
    await waitFor(() =>
      expect(getByText('Contributing SLO contain errors and needs to be addressed manually.')).toBeInTheDocument()
    )
    act(() => {
      fireEvent.mouseOver(getAllByTestId('SLOErrorIcon')[1]!)
    })
    await waitFor(() =>
      expect(getByText('The SLO is experiencing issues and is unable to collect data.')).toBeInTheDocument()
    )
  })

  test('Should be able to search the SLO', async () => {
    const { getByText, container } = render(<ComponentWrapper />)
    await waitFor(async () => {
      expect(getByText('SLO-4')).toBeInTheDocument()

      const searchBox = container.querySelector('input[placeholder="cv.slos.searchSLO"]') as HTMLInputElement
      fireEvent.change(searchBox, { target: { value: 'SLO1' } })

      await waitFor(() => {
        expect(searchBox.value).toEqual('SLO1')
      })
    })
  })

  test('Without monitoredServiceIdentifier it should render the page headers', () => {
    render(<ComponentWrapper />)

    expect(screen.queryByText('cv.slos.completeTitle')).toBeInTheDocument()
    expect(screen.getByText('cv.slos.createSLO')).toBeInTheDocument()
    expect(document.title).toBe('cv.srmTitle | cv.slos.title | project_identifier | harness')
  })

  test('With monitoredServiceIdentifier it should not render with the page headers', () => {
    render(<ComponentWrapper />)

    expect(screen.queryByText('cv.slos.completeTitle')).toBeInTheDocument()
    expect(screen.getByText('cv.slos.createSLO')).toBeInTheDocument()
  })

  test('add new SLO should go to create page', async () => {
    render(<ComponentWrapper />)

    userEvent.click(screen.getByText('cv.slos.createSLO'))

    expect(screen.getByText(routes.toCVCreateSLOs({ ...pathParams, module: 'cv' }))).toBeInTheDocument()
  })

  test('it should have monitored service identifier query param when adding new SLO from MS details page', () => {
    render(<ComponentWrapper />)

    userEvent.click(screen.getByText('cv.slos.createSLO'))

    expect(screen.getByText(routes.toCVCreateSLOs({ ...pathParams, module: 'cv' }))).toBeInTheDocument()
  })

  test('it should show the loader while fetching the user journeys', () => {
    useGetAllJourneys.mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() })

    render(<ComponentWrapper />)

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    expect(screen.queryByText('First Journey')).not.toBeInTheDocument()
  })

  test('it should show the loader while fetching the dashboard widgets', () => {
    useGetSLODashboardWidgets.mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() })

    const { container } = render(<ComponentWrapper />)

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    expect(container.querySelector('.TableV2--body [role="row"]')).not.toBeInTheDocument()
  })

  test('it should show the loader while deleting a widget', () => {
    useGetAllJourneys.mockReturnValue({
      data: userJourneyResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })
    useDeleteSLOV2Data.mockReturnValue({ mutate: jest.fn(), loading: true, error: null })
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    const { container } = render(<ComponentWrapper />)

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(2)
  })

  test('page retry should trigger both dashboard widget and user journey APIs when both returned error response', () => {
    useGetAllJourneys.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchUserJourneys
    })
    useGetSLODashboardWidgets.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchDashboardWidgets
    })

    render(<ComponentWrapper />)

    const onRetryButton = screen.getByRole('button', { name: 'Retry' })

    expect(onRetryButton).toBeInTheDocument()
    expect(refetchUserJourneys).not.toHaveBeenCalled()
    expect(refetchDashboardWidgets).toHaveBeenCalled()

    userEvent.click(onRetryButton)

    expect(refetchUserJourneys).toHaveBeenCalled()
    expect(refetchDashboardWidgets).toHaveBeenCalled()
  })

  test('page retry should only trigger the user journey API when dashboard widget API returned success response', () => {
    useGetAllJourneys.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchUserJourneys
    })

    render(<ComponentWrapper />)

    const onRetryButton = screen.getByRole('button', { name: 'Retry' })

    expect(onRetryButton).toBeInTheDocument()
    expect(refetchDashboardWidgets).toHaveBeenCalled()
    expect(refetchUserJourneys).not.toHaveBeenCalled()

    userEvent.click(onRetryButton)

    expect(refetchUserJourneys).toHaveBeenCalled()
  })

  test('page retry should only trigger the dashboard widget API when userJourney API returned success response', () => {
    useGetSLODashboardWidgets.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchDashboardWidgets
    })

    render(<ComponentWrapper />)

    const onRetryButton = screen.getByRole('button', { name: 'Retry' })

    expect(onRetryButton).toBeInTheDocument()
    expect(refetchDashboardWidgets).toHaveBeenCalled()

    userEvent.click(onRetryButton)

    expect(refetchUserJourneys).not.toHaveBeenCalled()
    expect(refetchDashboardWidgets).toHaveBeenCalled()
  })

  test('should render page body no data state only if dashboard widgets and selected user journey are empty', () => {
    useGetSLODashboardWidgets = jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: refetchDashboardWidgets
    } as any)

    const { container } = render(<ComponentWrapper />)

    expect(screen.getByText('common.sloNoData')).toBeInTheDocument()
    expect(screen.queryByText('First Journey')).not.toBeInTheDocument()
    expect(container.querySelector('.TableV2--body [role="row"]')).not.toBeInTheDocument()
  })

  test('should only render dashboard widgets when user journeys are empty', () => {
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<ComponentWrapper />)

    expect(screen.queryByText('First Journey')).not.toBeInTheDocument()
  })

  test('should render page body no data state only if dashboard widgets and selected user journey are empty', () => {
    useGetSLODashboardWidgets = jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: refetchDashboardWidgets
    } as any)
    render(<ComponentWrapper />)
    expect(screen.getByText('common.sloNoData')).toBeInTheDocument()
  })

  test('Risk filter select and deselect', async () => {
    useGetAllJourneys.mockReturnValue({
      data: userJourneyResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    const { container } = render(<ComponentWrapper />)

    expect(container.querySelector('div[data-test-id="Healthy_tooltip"]')?.parentElement).not.toHaveClass(
      'Card--selected'
    )

    userEvent.click(screen.getByText('Healthy'))
    expect(container.querySelector('div[data-test-id="Healthy_tooltip"]')?.parentElement).toHaveClass('Card--selected')

    userEvent.click(screen.getByText('Healthy'))
    expect(container.querySelector('div[data-test-id="Healthy_tooltip"]')?.parentElement).not.toHaveClass(
      'Card--selected'
    )
  })

  test('rendering the downtime status tooltip', async () => {
    const { container, getByText } = render(<ComponentWrapper />)

    const downtimeIcon = container.querySelector('[class*="downtimeIcon"]')
    fireEvent.mouseOver(downtimeIcon!)
    await waitFor(() => {
      expect(getByText('cv.sloDowntime.downtimeEndsOn')).toBeInTheDocument()
    })
  })

  test('deleting a widget', async () => {
    const deleteMutate = jest.fn()
    const refetch = jest.fn()

    useGetAllJourneys.mockReturnValue({
      data: userJourneyResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })
    useDeleteSLOV2Data.mockReturnValue({ mutate: deleteMutate, loading: false, error: null })
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: refetch
    })

    const { container, getByText, getByTestId, queryByText } = render(<ComponentWrapper />)

    // Cancelling deletion of widget
    await waitFor(() => userEvent.click(container.querySelector('[data-icon="main-trash"]') as HTMLElement))
    await waitFor(() => userEvent.click(getByText('cancel')))
    await waitFor(() => expect(queryByText('cv.slos.sloDeleted')).not.toBeInTheDocument())

    // Deleting the widget
    await waitFor(() => userEvent.click(container.querySelector('[data-icon="main-trash"]') as HTMLElement))
    await waitFor(() => userEvent.click(getByText('delete')))
    expect(deleteMutate).toHaveBeenCalledWith(dashboardWidgetsContent.sloIdentifier)
    await waitFor(() => expect(refetch).toHaveBeenCalled())
    await waitFor(() => expect(getByText('cv.slos.sloDeleted')).toBeInTheDocument())

    // Editing the SLO Widget
    await waitFor(() => userEvent.click(container.querySelector('[data-icon="Edit"]') as HTMLElement))
    expect(getByTestId('location').innerHTML).toContain(
      '/account/account_id/cv/orgs/org_identifier/projects/project_identifier/slos/slo_identifier?tab=Configurations'
    )
  })

  describe('Filters', () => {
    test('should check whether all the filters are present', () => {
      jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(true)
      useGetSLODashboardWidgets.mockReturnValue({
        data: dashboardWidgetsResponse,
        loading: false,
        error: null,
        refetch: jest.fn()
      })
      render(<ComponentWrapper />)

      const userJourneyFilter = screen.getByTestId('userJourney-filter')
      const monitoredServicesFilter = screen.getByTestId('monitoredServices-filter')
      const sloTargetAndBudgetFilter = screen.getByTestId('sloTargetAndBudget-filter')
      const sliTypeFilter = screen.getByTestId('sliType-filter')
      const evaluationTypeFilter = screen.getByTestId('evaluationType-filter')

      expect(userJourneyFilter).toBeInTheDocument()
      expect(monitoredServicesFilter).toBeInTheDocument()
      expect(sloTargetAndBudgetFilter).toBeInTheDocument()
      expect(sliTypeFilter).toBeInTheDocument()
      expect(evaluationTypeFilter).toBeInTheDocument()
    })
  })

  describe('Composite SLO', () => {
    test('should check comopsite SLO button is present', () => {
      jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(true)
      jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
        data: mockSLODashboardWidgetsData,
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)
      const { getByTestId, getByText } = render(<ComponentWrapper />)
      expect(getByTestId('createCompositeSLO')).toBeInTheDocument()
      expect(getByText('Composite')).toBeInTheDocument()
    })

    test('deleting a composite SLO', async () => {
      const deleteMutate = jest.fn()
      jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(true)
      jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
        data: mockSLODashboardWidgetsData,
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)
      jest
        .spyOn(cvServices, 'useDeleteSLOV2Data')
        .mockReturnValue({ mutate: deleteMutate, loading: false, error: null } as any)

      const { container, getByText, getByTestId } = render(<ComponentWrapper />)

      // Deleting the widget
      await waitFor(() => userEvent.click(container.querySelector('[data-icon="main-trash"]') as HTMLElement))
      await waitFor(() => userEvent.click(getByText('delete')))
      expect(deleteMutate).toHaveBeenCalledWith(mockSLODashboardWidgetsData.data.content[0].sloIdentifier)

      // Editing the SLO Widget
      await waitFor(() => userEvent.click(container.querySelector('[data-icon="Edit"]') as HTMLElement))
      expect(getByTestId('location').innerHTML).toContain(
        '/account/account_id/cv/orgs/org_identifier/projects/project_identifier/slos/SLO4?tab=Configurations&amp;sloType=Composite'
      )
    })
  })
})
