/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import type { Point } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import {
  serviceLevelIndicator,
  testWrapperProps,
  errorMessage
} from '@cv/pages/slos/components/CVCreateSLOV2/__tests__/CVCreateSLOV2.mock'
import { SLIMetricEnum } from '@cv/pages/slos/common/SLI/SLI.constants'
import SLOTargetChartWrapper from '../SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '../SLOTargetChart.utils'

describe('SLOTargetChart Utils', () => {
  test('Should return min and max values without rounding', () => {
    const dataPoints: Point[] = [
      {
        timestamp: 101,
        value: 90
      },
      {
        timestamp: 105,
        value: 80
      },
      {
        timestamp: 110,
        value: 85
      }
    ]

    expect(getDataPointsWithMinMaxXLimit(dataPoints)).toStrictEqual({
      dataPoints: [
        [101, 90],
        [105, 80],
        [110, 85]
      ],
      minXLimit: 80,
      maxXLimit: 90
    })
  })

  test('Should return min and max values by rounding', () => {
    const dataPoints: Point[] = [
      {
        timestamp: 101,
        value: 98
      },
      {
        timestamp: 105,
        value: 82
      }
    ]

    expect(getDataPointsWithMinMaxXLimit(dataPoints)).toStrictEqual({
      dataPoints: [
        [101, 98],
        [105, 82]
      ],
      minXLimit: 80,
      maxXLimit: 100
    })
  })

  test('Should handle NaN and string types', () => {
    const dataPoints: Point[] = [
      {
        timestamp: NaN,
        value: NaN
      },
      {
        timestamp: 105,
        value: 82
      },
      {
        timestamp: 'NaN' as unknown as number,
        value: 'NaN' as unknown as number
      }
    ]

    expect(getDataPointsWithMinMaxXLimit(dataPoints)).toStrictEqual({
      dataPoints: [
        [0, 0],
        [105, 82],
        [0, 0]
      ],
      minXLimit: 0,
      maxXLimit: 90
    })
  })
})

describe('SLOTargetChartWrapper', () => {
  test('it should render empty state for Ratio based with objective value > 100', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          retryOnError={jest.fn()}
          serviceLevelIndicator={{
            ...serviceLevelIndicator,
            spec: {
              ...serviceLevelIndicator.spec,
              spec: {
                ...serviceLevelIndicator.spec.spec,
                thresholdValue: 101
              }
            }
          }}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')).toBeInTheDocument()
  })

  test('it should not render empty state for Threshold based with objective value > 100', async () => {
    const serviceLevelIndicatorThreshold = {
      ...serviceLevelIndicator,
      spec: {
        type: SLIMetricEnum.THRESHOLD,
        spec: {
          ...serviceLevelIndicator.spec.spec,
          thresholdValue: 101
        }
      }
    }

    render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={serviceLevelIndicatorThreshold}
          retryOnError={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')).not.toBeInTheDocument()
  })

  test('it should render loader', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={serviceLevelIndicator}
          loading
          retryOnError={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('it should render error message', async () => {
    const retryOnError = jest.fn()

    render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={serviceLevelIndicator}
          error={errorMessage}
          retryOnError={retryOnError}
        />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    userEvent.click(screen.getByText('Retry'))

    await waitFor(() => expect(retryOnError).toBeCalledWith(serviceLevelIndicator, 'Service_1_Environment_1'))
  })
})
