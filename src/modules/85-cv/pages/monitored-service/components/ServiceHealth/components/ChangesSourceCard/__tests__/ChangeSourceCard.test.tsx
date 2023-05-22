/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import ChangesSourceCard from '../ChangesSourceCard'
import {
  changeSummary,
  changeSummaryWithPositiveChange,
  changeSummaryWithNegativeChange,
  changeSourceCardData,
  changeSourceCardDataWithPositiveGrowth,
  expectedPositiveTextContent,
  expectedNegativeTextContent,
  changeSummaryWithAbove100PositiveChange,
  expectedAbove100PositiveTextContent
} from './ChangeSourceCard.mock'
import { calculateChangePercentage } from '../ChangesSourceCard.utils'

const monitoredServiceIdentifier = 'monitored_service_identifier'

const WrapperComponent = (): JSX.Element => (
  <TestWrapper defaultFeatureFlagValues={{ SRM_INTERNAL_CHANGE_SOURCE_CE: true }}>
    <ChangesSourceCard monitoredServiceIdentifier={monitoredServiceIdentifier} startTime={0} endTime={0} />
  </TestWrapper>
)

describe('Test ChangeSourceCard', () => {
  test('should render with positive change', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceChangeEventSummary').mockImplementation(
      () =>
        ({
          data: { resource: { ...changeSummaryWithPositiveChange } },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(<WrapperComponent />)
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-up"]').length).toEqual(5)
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedPositiveTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })

  test('should render with negative change', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceChangeEventSummary').mockImplementation(
      () =>
        ({
          data: { resource: { ...changeSummaryWithNegativeChange } },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(<WrapperComponent />)
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-down"]').length).toEqual(5)
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedNegativeTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })

  test('should render with above 100 positive change', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceChangeEventSummary').mockImplementation(
      () =>
        ({
          data: { resource: { ...changeSummaryWithAbove100PositiveChange } },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(<WrapperComponent />)
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-up"]').length).toEqual(5)
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedAbove100PositiveTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })

  test('validate loading', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceChangeEventSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container, getAllByTestId } = render(<WrapperComponent />)
    expect(getAllByTestId('loading-block')).toHaveLength(6)
    expect(container).toMatchSnapshot()
  })

  test('validate loading with CE feature flag off', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceChangeEventSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )

    const { getAllByTestId } = render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_INTERNAL_CHANGE_SOURCE_CE: false }}>
        <ChangesSourceCard monitoredServiceIdentifier={monitoredServiceIdentifier} startTime={0} endTime={0} />
      </TestWrapper>
    )
    expect(getAllByTestId('loading-block')).toHaveLength(5)
  })

  test('validate error state', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceChangeEventSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container, getByText } = render(<WrapperComponent />)

    expect(getByText('cv.monitoredServices.failedToFetchSummaryData')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('validate calculateChangePercentage', () => {
    const getString = (val: string): string => val
    expect(calculateChangePercentage(getString, changeSummary)).toEqual(changeSourceCardData)
    expect(calculateChangePercentage(getString, changeSummaryWithPositiveChange)).toEqual(
      changeSourceCardDataWithPositiveGrowth
    )
  })
})
