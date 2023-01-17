import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { serviceListResponse } from '@cd/mock'
import { useGetServiceList } from 'services/cd-ng'
import { startOfDay, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { ServiceTab } from './ServiceTabs'

jest.mock('services/cd-ng', () => {
  return {
    GetServiceDetailsQueryParams: jest.fn(),
    useGetServiceDetails: jest.fn(() => ({ loading: false })),
    useGetServiceDetailsV2: jest.fn(() => ({ loading: false })),
    useGetWorkloads: jest.fn(() => ({ loading: false, data: null })),
    useGetWorkloadsV2: jest.fn(() => ({ loading: false, data: null })),
    useGetServicesGrowthTrend: jest.fn(() => ({ data: null })),
    useGetServiceDeploymentsInfo: jest.fn(() => ({ loading: false })),
    useGetServiceDeploymentsInfoV2: jest.fn(() => ({ loading: false })),
    useDeleteServiceV2: jest.fn(() => ({ mutate: jest.fn() })),
    useGetServiceList: jest.fn(() => ({
      data: serviceListResponse,
      loading: false,
      refetch: jest.fn()
    })),
    useGetYamlSchema: jest.fn(() => ({ data: null })),
    useCreateServiceV2: jest.fn(() => ({ mutate: jest.fn() })),
    useUpsertServiceV2: jest.fn(() => ({ mutate: jest.fn() }))
  }
})

const timeRangeMock: TimeRangeSelectorProps = {
  range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
  label: 'Last 30 days'
}

describe('ServicesTabs', () => {
  test('Service subheader test', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceTab setTimeRange={jest.fn()} timeRange={timeRangeMock} />
      </TestWrapper>
    )
    //go to ManageService Tab
    userEvent.click(getByText('cd.serviceDashboard.manageServiceLabel'))

    //check service list appearing
    expect(getByText('dfg')).toBeTruthy()

    const searchInput = container.querySelector('[type="search"]')
    if (!searchInput) {
      throw Error('No search input')
    }
    fireEvent.change(searchInput, { target: { value: 'dfg' } })

    await waitFor(() =>
      expect(useGetServiceList).toBeCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'comma' },
        queryParams: {
          accountIdentifier: 'dummy',
          orgIdentifier: 'dummy',
          page: 0,
          projectIdentifier: 'dummy',
          searchTerm: 'dfg',
          size: 10,
          sort: ['lastModifiedAt', 'DESC']
        }
      })
    )

    //go back to Dashboard Tab
    userEvent.click(getByText('dashboardLabel'))

    //test service addition button working
    userEvent.click(container.querySelector('[data-testid="add-service"]') as HTMLElement)
    const form = findDialogContainer() as HTMLElement
    expect(form).toBeTruthy()
    expect(getByText('cd.addService')).toBeTruthy()

    const closeBtn = form.querySelector('[data-icon="Stroke"]')
    userEvent.click(closeBtn!)
  })
})
