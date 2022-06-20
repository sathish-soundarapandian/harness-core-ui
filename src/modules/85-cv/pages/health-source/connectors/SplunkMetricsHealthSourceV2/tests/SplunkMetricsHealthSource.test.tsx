/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { SplunkMetricsHealthSource, SplunkMetricsHealthSourceProps } from '../SplunkMetricsHealthSource'
import { MockManualQueryData } from './SplunkMetricsHealthSource.mock'

function WrapperComponent(props: SplunkMetricsHealthSourceProps): JSX.Element {
  return (
    <TestWrapper>
      <SplunkMetricsHealthSource data={props.data} onSubmit={props.onSubmit} />
    </TestWrapper>
  )
}

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

const fetchSplunkQuery = jest.fn()

// eslint-disable-next-line jest/no-disabled-tests
describe('Unit tests for SplunkMetricsHealthSource', () => {
  beforeAll(() => {
    jest.spyOn(cvService, 'useGetLabelNames').mockReturnValue({ data: { data: [] } } as any)
    jest.spyOn(cvService, 'useGetMetricNames').mockReturnValue({ data: { data: [] } } as any)
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] } } as any)
    jest.spyOn(cvService, 'useGetSplunkMetricSampleData').mockReturnValue({
      loading: false,
      error: null,
      data: {
        metaData: {},
        resource: [
          { txnName: 'default', metricName: 'sample', metricValue: 1282.0, timestamp: 1654798680000 },
          { txnName: 'default', metricName: 'sample', metricValue: 1654.1818181818182, timestamp: 1654798800000 }
        ],
        responseMessages: []
      },
      refetch: fetchSplunkQuery
    } as any)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Component renders', async () => {
    const onSubmitMock = jest.fn()
    const { container } = render(<WrapperComponent data={MockManualQueryData} onSubmit={onSubmitMock} />)

    await waitFor(() => expect(screen.getByText('cv.query')).not.toBeNull())
    const queryTextarea = screen.getByPlaceholderText(/cv.healthSource.splunkMetric.queryTextareaPlaceholder/)
    expect(queryTextarea).toBeInTheDocument()

    act(() => {
      fireEvent.change(queryTextarea, { target: { value: 'newQuery' } })

      fireEvent.click(screen.getByText(/cv.monitoringSources.gcoLogs.fetchRecords/))
    })

    expect(container.querySelectorAll('[class*="Accordion--panel"]').length).toBe(2)
  })
})
