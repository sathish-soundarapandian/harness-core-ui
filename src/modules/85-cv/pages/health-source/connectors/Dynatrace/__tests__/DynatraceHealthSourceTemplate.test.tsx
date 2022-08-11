/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-test-renderer'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  MockTemplateMetricData,
  mockUseGetDynatraceServices
} from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import * as cvService from 'services/cv'
import DynatraceHealthSource from '../DynatraceHealthSource'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

describe('Validate DynatraceHealthSource', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest
      .spyOn(cvService, 'useGetDynatraceSampleData')
      .mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest.spyOn(cvService, 'useGetAllDynatraceServiceMetrics').mockReturnValue({
      data: {
        data: [
          {
            displayName: 'CPU per request',
            metricId: 'builtin:service.cpu.perRequest'
          }
        ]
      },
      refetch: jest.fn()
    } as any)
    jest.spyOn(cvService, 'useGetAllDynatraceServiceMetrics').mockReturnValue(mockUseGetDynatraceServices as any)
  })

  test('should render DynatraceMetricPacksToService with runtimeInputs', async () => {
    const { container } = render(
      <TestWrapper>
        <DynatraceHealthSource
          isTemplate
          onSubmit={jest.fn()}
          onPrevious={jest.fn()}
          dynatraceFormData={MockTemplateMetricData}
          connectorIdentifier={RUNTIME_INPUT_VALUE}
        />
      </TestWrapper>
    )
    expect(container.querySelector('input[name="dynatraceService"]')).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(container.querySelector('div[data-testid="querySpecificationsAndMapping-summary"]')).toBeInTheDocument()
    act(() => {
      fireEvent.click(container.querySelector('div[data-testid="querySpecificationsAndMapping-summary"]')!)
    })
    expect(container.querySelector('input[name="metricSelector"]')).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(container).toMatchSnapshot()
  })
})
