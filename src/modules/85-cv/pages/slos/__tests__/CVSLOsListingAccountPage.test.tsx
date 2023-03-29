import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import CVSLOsListingPage from '../CVSLOsListingPage'
import type { CVSLOsListingPageProps } from '../CVSLOsListingPage.types'
import { testWrapperProps, mockSLODashboardWidgetsData } from './CVSLOsListingPage.mock'

jest.mock('@cv/pages/slos/SLOCard/SLOCardContent.tsx', () => ({
  __esModule: true,
  default: function SLOCardContent() {
    return <span data-testid="slo-card-content" />
  }
}))

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    orgIdentifier: undefined,
    projectIdentifier: undefined,
    accountId: 'accountId',
    identifier: 'identifier',
    module: 'cv'
  }),
  useHistory: jest.fn(() => ({
    push: mockHistoryPush
  }))
}))

const refetchDashboardWidgets = jest.fn()
jest.spyOn(cvServices, 'useGetAllJourneys').mockReturnValue({
  data: {},
  loading: false,
  error: null,
  refetch: jest.fn()
} as any)

jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
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

const ComponentWrapper: React.FC<CVSLOsListingPageProps> = ({ monitoredService }) => {
  return (
    <TestWrapper {...testWrapperProps}>
      <CVSLOsListingPage monitoredService={monitoredService} />
    </TestWrapper>
  )
}
describe('Filters reset on account page change assertions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Correct API call must be made when user switches to account level SLOs', async () => {
    const { container } = render(<ComponentWrapper />)

    expect(container.querySelector('div[data-test-id="Healthy_tooltip"]')?.parentElement).not.toHaveClass(
      'Card--selected'
    )

    await waitFor(() => {
      expect(refetchDashboardWidgets).toHaveBeenCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: 'accountId',
          filter: '',
          monitoredServiceIdentifier: 'All',
          orgIdentifier: undefined,
          pageNumber: 0,
          pageSize: 10,
          projectIdentifier: undefined,
          sliTypes: ['All'],
          targetTypes: ['All'],
          userJourneyIdentifiers: ['All']
        }
      })
    })
  })
})
