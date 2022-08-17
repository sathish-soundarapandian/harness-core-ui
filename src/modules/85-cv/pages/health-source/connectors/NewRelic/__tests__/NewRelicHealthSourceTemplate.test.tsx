/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import NewRelicHealthSource from '../NewRelicHealthSource'
import {
  metricPack,
  applicationData,
  validationData,
  NewRelicInputFormTemplateData,
  templateWithCustomMetric
} from './NewRelic.mock'

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())
const refetchMock = jest.fn()

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { sourceType: Connectors.NEW_RELIC },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

// eslint-disable-next-line jest/no-disabled-tests
describe('Unit tests for NewRelic health source', () => {
  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetNewRelicApplications')
      .mockImplementation(() => ({ loading: false, error: null, data: applicationData, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: metricPack, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getNewRelicMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: validationData.data } as any))
  })

  test('Template should work with all runtime values', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <NewRelicHealthSource
          isTemplate={true}
          data={NewRelicInputFormTemplateData}
          onSubmit={submitData}
          onPrevious={jest.fn()}
        />
      </TestWrapper>
    )

    // should be default runtime
    expect(container.querySelector('input[name="newRelicApplication"]')).toHaveValue('<+input>')
    const performanceCheckbox = container.querySelector('input[name="metricData.Performance"]')
    act(() => {
      fireEvent.click(performanceCheckbox!)
    })
    await waitFor(() => expect(performanceCheckbox).toBeChecked())
    await act(() => {
      fireEvent.click(getByText('submit'))
    })
    expect(submitData).toHaveBeenCalledWith(
      expect.objectContaining({
        connectorRef: '<+input>',
        newRelicApplication: '<+input>',
        metricData: {
          Performance: true
        }
      })
    )
  })

  test('Template should work with custom metric having all runtime values', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <NewRelicHealthSource
          isTemplate={true}
          data={templateWithCustomMetric}
          onSubmit={submitData}
          onPrevious={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('input[name="newRelicApplication"]')).toHaveValue('<+input>')
    const performanceCheckbox = container.querySelector('input[name="metricData.Performance"]')
    await waitFor(() => expect(performanceCheckbox).toBeChecked())
    expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).toBeTruthy()
    await act(() => {
      fireEvent.click(getByText('submit'))
    })
    act(() => {
      fireEvent.click(container.querySelector('div[data-testid="querySpecificationsAndMapping-summary"]')!)
    })
    expect(container.querySelector('input[name="query"]')).toHaveValue('<+input>')

    act(() => {
      fireEvent.click(container.querySelector('div[data-testid="metricChart-summary"]')!)
    })
    expect(container.querySelector('input[name="metricValue"]')).toHaveValue('<+input>')
    expect(container.querySelector('input[name="timestamp"]')).toHaveValue('<+input>')

    expect(submitData).toHaveBeenCalledWith(
      expect.objectContaining({
        connectorRef: '<+input>',
        newRelicApplication: '<+input>',
        metricData: {
          Performance: true
        },
        metricValue: '<+input>',
        query: '<+input>',
        riskCategory: 'Performance/RESP_TIME',
        showCustomMetric: true,
        sli: true,
        timestamp: '<+input>'
      })
    )
  })
})
