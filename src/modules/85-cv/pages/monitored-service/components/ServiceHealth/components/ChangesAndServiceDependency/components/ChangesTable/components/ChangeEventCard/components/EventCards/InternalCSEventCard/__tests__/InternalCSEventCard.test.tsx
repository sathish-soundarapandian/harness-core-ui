/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import * as cfService from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import { mockedHealthScoreData } from '@cv/pages/monitored-service/components/ServiceHealth/components/HealthScoreChart/__tests__/HealthScoreChart.mock'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { HarnessFFMockData, HarnessFFYAMLResponse } from './InternalCSEventCard.mock'
import InternalCSEventCard from '../InternalCSEventCard'
import YAMLDiffView from '../components/YAMLDiffView'

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

jest.mock(
  '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/SLOAndErrorBudget/SLOAndErrorBudget',
  () => ({
    __esModule: true,
    default: function SLOAndErrorBudget() {
      return <div data-testid="SLO-and-errorBudget" />
    }
  })
)

describe('Validate Internal Change Source Card', () => {
  test('should render Feature flag data', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: mockedHealthScoreData,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cfService, 'useGetOSByID').mockImplementation(
      () =>
        ({
          data: HarnessFFYAMLResponse,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <InternalCSEventCard data={HarnessFFMockData.resource} />
      </TestWrapper>
    )
    // Card Title is rendered Correctly
    await waitFor(() => expect(getByText(HarnessFFMockData.resource.name)).toBeTruthy())

    // Card details title
    await waitFor(() => expect(getAllByText('details')).toHaveLength(1))
    await waitFor(() => expect(getAllByText('action')).toHaveLength(1))
    await waitFor(() => expect(getAllByText('auditTrail.yamlDifference')).toHaveLength(1))
  })

  test('should render Feature flag card YAML Diff component in loading state', async () => {
    jest.spyOn(cfService, 'useGetOSByID').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <YAMLDiffView url={'url'} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy())
  })

  test('should render Feature flag card YAML Diff component in error state', async () => {
    jest.spyOn(cfService, 'useGetOSByID').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: { message: 'Internal Server error' },
          loading: false
        } as any)
    )
    const { getByText } = render(
      <TestWrapper>
        <YAMLDiffView url={'url'} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('Retry')).toBeTruthy())
    fireEvent.click(getByText('Retry'))
  })

  test('should render Feature flag card YAML Diff component in no data available state', async () => {
    jest.spyOn(cfService, 'useGetOSByID').mockImplementationOnce(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { getByText } = render(
      <TestWrapper>
        <YAMLDiffView url={'url'} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.changeSource.FeatureFlag.noDataAvailableForYAMLDiff')).toBeTruthy())
  })
})
