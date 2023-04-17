import React, { useEffect, useState } from 'react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-test-renderer'
import { render, waitFor, screen } from '@testing-library/react'
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
  useParams: () => {
    const [projectIdentifier, setProjectIdentifier] = useState<string>('project1')

    useEffect(() => {
      setTimeout(() => {
        setProjectIdentifier('project2')
      }, 1000)
    }, [])

    return {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier,
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }
  },
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

describe('Filters reset on project change assertions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Filters should get reset when user changes the project after applying the filters', async () => {
    const { container } = render(<ComponentWrapper />)
    expect(2).toBeTruthy()

    expect(container.querySelector('div[data-test-id="Healthy_tooltip"]')?.parentElement).not.toHaveClass(
      'Card--selected'
    )

    refetchDashboardWidgets.mockClear()

    act(() => {
      userEvent.click(screen.getByText('Healthy'))
    })

    expect(container.querySelector('div[data-test-id="Healthy_tooltip"]')?.parentElement).toHaveClass('Card--selected')

    await waitFor(() => {
      expect(refetchDashboardWidgets).toHaveBeenCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: 'accountId',
          errorBudgetRisks: ['HEALTHY'],
          monitoredServiceIdentifier: 'All',
          orgIdentifier: 'orgIdentifier',
          pageNumber: 0,
          pageSize: 10,
          projectIdentifier: 'project1',
          sliTypes: ['All'],
          targetTypes: ['All'],
          evaluationType: ['All'],
          userJourneyIdentifiers: ['All']
        }
      })
    })

    refetchDashboardWidgets.mockClear()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(refetchDashboardWidgets).toHaveBeenCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: 'accountId',
          errorBudgetRisks: undefined,
          monitoredServiceIdentifier: 'All',
          orgIdentifier: 'orgIdentifier',
          pageNumber: 0,
          pageSize: 10,
          projectIdentifier: 'project2',
          sliTypes: ['All'],
          targetTypes: ['All'],
          evaluationType: ['All'],
          userJourneyIdentifiers: ['All']
        }
      })
    })
  })
})
