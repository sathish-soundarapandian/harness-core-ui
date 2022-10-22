/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { GCOMetricsHealthSource } from '../GCOMetricsHealthSource'
import { MockQuery, MockValidationResponse, sourceDataTemplate } from './GCOMetricsHealthSource.mock'
import { FieldNames } from '../GCOMetricsHealthSource.constants'
import type { GCOMetricsHealthSourceProps } from '../GCOMetricsHealthSource.type'
import { riskCategoryMock } from '../../__tests__/HealthSources.mock'

function WrapperComponent({ data, onSubmit }: GCOMetricsHealthSourceProps) {
  return (
    <TestWrapper>
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <GCOMetricsHealthSource data={data} onSubmit={onSubmit} isTemplate expressions={[]} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const mutateMock = jest.fn().mockReturnValue(
  Promise.resolve({
    ...MockValidationResponse
  })
)

jest.mock('services/cv', () => ({
  useGetStackdriverDashboardDetail: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn(), error: null, loading: false }
  }),
  useGetMetricPacks: jest.fn().mockImplementation(() => {
    return { data: { data: [] } } as any
  }),
  useGetMetricNames: jest.fn().mockImplementation(() => {
    return { data: { data: [] } } as any
  }),
  useGetRiskCategoryForCustomHealthMetric: jest.fn().mockImplementation(() => {
    return { loading: false, error: null, data: riskCategoryMock } as any
  }),
  useGetStackdriverSampleData: jest.fn().mockImplementation(() => {
    return { mutate: mutateMock, cancel: jest.fn() }
  })
}))

describe('Test GCOMetricsHealthSource with Template', () => {
  test('Should update query type from runtime to fixed', async () => {
    const { container, getByText } = render(<WrapperComponent data={sourceDataTemplate} onSubmit={jest.fn()} />)
    expect(container.querySelector('[data-icon="runtime-input"]')).toBeVisible()
    fireEvent.click(container.querySelector('[data-icon="runtime-input"]')!)
    expect(container.querySelector('[name="query"]')).toHaveValue('<+input>')
    expect(document.querySelectorAll('.MultiTypeInput--menuItemLabel').length).toEqual(3)
    fireEvent.click(document.querySelectorAll('.MultiTypeInput--menuItemLabel')[0]!)
    expect(container.querySelector('button[disabled=""]')).toHaveTextContent(
      'cv.monitoringSources.gcoLogs.fetchRecords'
    )
    expect(getByText('cv.monitoringSources.gcoLogs.fetchRecords')).toBeInTheDocument()
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })
    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
  })
})
