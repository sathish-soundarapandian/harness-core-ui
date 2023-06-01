import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useGetMonitoredService } from 'services/cv'
import { PROJECT_MONITORED_SERVICE_CONFIG } from '@cv/components/MonitoredServiceWidget/MonitoredServiceWidget.constants'
import CommonMonitoredServiceDetails from '../CommonMonitoredServiceDetails'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({
    accountId: 'accountId',
    orgIdentifier: 'orgIdentifier',
    projectIdentifier: 'projectIdentifier',
    identifier: 'identifier'
  })
}))

describe('CommonMonitoredServiceDetails', () => {
  const mockedUseGetMonitoredService = useGetMonitoredService as jest.Mock

  beforeEach(() => {
    mockedUseGetMonitoredService.mockReturnValue({
      data: {
        data: {
          monitoredService: {
            // mock monitoredService data
          },
          lastModifiedAt: '2022-01-01'
        }
      },
      refetch: jest.fn(),
      loading: false,
      error: null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test.only('should render the loading state', () => {
    mockedUseGetMonitoredService.mockReturnValue({
      data: null,
      refetch: jest.fn(),
      loading: true,
      error: null
    })

    const { getByTestId } = render(<CommonMonitoredServiceDetails config={PROJECT_MONITORED_SERVICE_CONFIG} />)

    // Assert the loading state
    expect(getByTestId('loading')).toBeInTheDocument()
  })

  test('should render the no data card', () => {
    mockedUseGetMonitoredService.mockReturnValue({
      data: {
        data: null
      },
      refetch: jest.fn(),
      loading: false,
      error: null
    })

    render(<CommonMonitoredServiceDetails config={{}} />)

    // Assert the no data card
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  test('should render the error message', () => {
    mockedUseGetMonitoredService.mockReturnValue({
      data: null,
      refetch: jest.fn(),
      loading: false,
      error: new Error('API error')
    })

    render(<CommonMonitoredServiceDetails config={{}} />)

    // Assert the error message
    expect(screen.getByText('API error')).toBeInTheDocument()
  })

  test('should navigate to the correct route when project is changed', () => {
    const mockHistoryPush = jest.fn()
    const mockRoutes = {
      toMonitoredServices: jest.fn()
    }
    const mockedUseHistory = {
      push: mockHistoryPush
    }
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useHistory: () => mockedUseHistory
    }))
    jest.mock('@common/RouteDefinitions', () => mockRoutes)

    const config = {
      module: 'exampleModule'
    }

    mockedUseGetMonitoredService.mockReturnValue({
      data: null,
      refetch: jest.fn(),
      loading: false,
      error: new Error('Project changed')
    })

    render(
      <BrowserRouter>
        <CommonMonitoredServiceDetails config={config} />
      </BrowserRouter>
    )

    // Assert the navigation to the correct route
    expect(mockRoutes.toMonitoredServices).toHaveBeenCalledWith({
      projectIdentifier: undefined,
      orgIdentifier: undefined,
      accountId: undefined,
      module: 'exampleModule'
    })
    expect(mockHistoryPush).toHaveBeenCalled()
  })
})
