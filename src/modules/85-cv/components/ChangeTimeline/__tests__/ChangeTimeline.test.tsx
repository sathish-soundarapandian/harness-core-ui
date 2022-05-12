/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeTimeline from '../ChangeTimeline'
import type { ChangeTimelineProps } from '../ChangeTimeline.types'

const onSliderMoved = jest.fn()
jest.mock('services/cv', () => ({
  useChangeEventTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: {
          categoryTimeline: {
            Deployment: [],
            Infrastructure: [],
            Alert: []
          }
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useGetMonitoredServiceChangeTimeline: jest.fn().mockReturnValue({
    data: {
      resource: {
        categoryTimeline: {
          Deployment: [],
          Infrastructure: [],
          Alert: []
        }
      }
    },
    refetch: jest.fn(),
    error: null,
    loading: false,
    cancel: jest.fn()
  })
}))

const defaultProps = {
  serviceIdentifier: '',
  environmentIdentifier: '',
  timestamps: [],
  timeFormat: '',
  startTime: 0,
  endTime: 0,
  onSliderMoved
}

function WrapperComponent(props: ChangeTimelineProps): JSX.Element {
  return (
    <TestWrapper>
      <ChangeTimeline {...props} />
    </TestWrapper>
  )
}

describe('Render ChangeTimeline', () => {
  test('should render with empty data', async () => {
    const { container } = render(<WrapperComponent {...defaultProps} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineNoData"]')).toBeTruthy())
  })

  test('should render with error state', async () => {
    jest.spyOn(cvServices, 'useChangeEventTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: {
            data: {
              message: 'api call failed'
            }
          },
          loading: false,
          cancel: jest.fn()
        } as any)
    )
    jest.spyOn(cvServices, 'useGetMonitoredServiceChangeTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: {
            data: {
              message: 'api call failed'
            }
          },
          loading: false,
          cancel: jest.fn()
        } as any)
    )
    const { container } = render(<WrapperComponent {...defaultProps} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineError"]')).toBeTruthy())
  })

  test('should render with loading state', async () => {
    jest.spyOn(cvServices, 'useChangeEventTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true,
          cancel: jest.fn()
        } as any)
    )
    jest.spyOn(cvServices, 'useGetMonitoredServiceChangeTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true,
          cancel: jest.fn()
        } as any)
    )
    const { container } = render(<WrapperComponent {...defaultProps} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineLoading"]')).toBeTruthy())
  })

  test('it should call useChangeEventTimeline with monitoredServiceIdentifiers', async () => {
    const refetch = jest.fn()
    const sliderTimeRange = { startTime: 1639993400000, endTime: 1639993420000 }

    jest.spyOn(cvServices, 'useChangeEventTimeline').mockReturnValue({ data: {}, refetch, cancel: jest.fn() } as any)

    render(
      <WrapperComponent
        {...defaultProps}
        monitoredServiceIdentifier="monitored_service_identifier"
        selectedTimeRange={sliderTimeRange}
      />
    )

    await waitFor(() => {
      expect(refetch).toHaveBeenLastCalledWith({
        queryParams: {
          monitoredServiceIdentifiers: ['monitored_service_identifier'],
          changeCategories: [],
          changeSourceTypes: [],
          ...sliderTimeRange
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('it should call useChangeEventTimeline without monitoredServiceIdentifiers', async () => {
    const refetch = jest.fn()
    const sliderTimeRange = { startTime: 1639993400000, endTime: 1639993420000 }
    const serviceIdentifier = 'SERVICE_IDENTIFIER'
    const environmentIdentifier = 'ENV_IDENTIFIER'

    jest.spyOn(cvServices, 'useChangeEventTimeline').mockReturnValue({ data: {}, refetch, cancel: jest.fn() } as any)

    render(
      <WrapperComponent
        {...defaultProps}
        selectedTimeRange={sliderTimeRange}
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
      />
    )

    await waitFor(() => {
      expect(refetch).toHaveBeenLastCalledWith({
        queryParams: {
          changeCategories: [],
          changeSourceTypes: [],
          serviceIdentifiers: [serviceIdentifier],
          envIdentifiers: [environmentIdentifier],
          ...sliderTimeRange
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })

  test('it should call useChangeEventTimeline with multiple service and environments', async () => {
    const refetch = jest.fn()
    const sliderTimeRange = { startTime: 1639993400000, endTime: 1639993420000 }
    const serviceIdentifier = 'SERVICE_IDENTIFIER'
    const environmentIdentifier = 'ENV_IDENTIFIER'

    jest.spyOn(cvServices, 'useChangeEventTimeline').mockReturnValue({ data: {}, refetch, cancel: jest.fn() } as any)

    render(
      <WrapperComponent
        {...defaultProps}
        selectedTimeRange={sliderTimeRange}
        serviceIdentifier={[serviceIdentifier]}
        environmentIdentifier={[environmentIdentifier]}
      />
    )

    await waitFor(() => {
      expect(refetch).toHaveBeenLastCalledWith({
        queryParams: {
          changeCategories: [],
          changeSourceTypes: [],
          serviceIdentifiers: [serviceIdentifier],
          envIdentifiers: [environmentIdentifier],
          ...sliderTimeRange
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })
})
