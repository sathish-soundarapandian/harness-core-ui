/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, waitFor, screen, getByText } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import type { UseGetReturn } from 'restful-react'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import MetricsDashboardList from '@cv/components/MetricsDashboardList/MetricsDashboardList'
import { DefaultObject, MockData, MockParams, testWrapperProps } from '@cv/components/MetricsDashboardList/tests/mock'
import Mock = jest.Mock

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

function WrapperComponent(content: React.ReactElement): JSX.Element {
  return (
    <TestWrapper {...testWrapperProps}>
      <SetupSourceTabs data={cloneDeep(DefaultObject)} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        {content}
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('MetricDashboardList unit tests', () => {
  let mockedReturnedValue: UseGetReturn<any, any, any>
  let refetchMock: Mock
  let tableMapper: Mock

  beforeEach(() => {
    jest.clearAllMocks()
    refetchMock = jest.fn()
    tableMapper = jest.fn()

    MockData.data.data.content.forEach(item => {
      tableMapper.mockReturnValueOnce({ name: item.name, id: item.path })
    })
    mockedReturnedValue = {
      data: { data: { content: [] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any>
  })
  test('When api returns nothing, ensure no data state is rendered', async () => {
    const { container } = render(
      WrapperComponent(
        <MetricsDashboardList
          manualQueryInputTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          tableItemMapper={tableMapper}
          dashboardsRequest={mockedReturnedValue}
          tableTitle={'cv.monitoringSources.datadog.selectDashboardsPage.dashboardColumnName'}
          defaultItemIcon={'service-datadog'}
          selectedDashboardList={[]}
        />
      )
    )
    await waitFor(() => expect(container.querySelector('[class*="loadingErrorNoData"]')).not.toBeNull())

    expect(screen.getByText('cv.monitoringSources.gco.addManualInputQuery')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.monitoringSources.gco.addManualInputQuery'))

    const dialogContainer = findDialogContainer()

    expect(getByText(dialogContainer!, 'cv.monitoringSources.metricNameLabel')).toBeInTheDocument()

    setFieldValue({
      container: dialogContainer!,
      type: InputTypes.TEXTFIELD,
      fieldId: 'metricName',
      value: 'GCO Metric'
    })

    await userEvent.click(getByText(dialogContainer!, 'submit'))
  })

  test('When api returns and error, ensure error state is rendered', async () => {
    const { container } = render(
      WrapperComponent(
        <MetricsDashboardList
          manualQueryInputTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          tableItemMapper={tableMapper}
          dashboardsRequest={mockedReturnedValue}
          tableTitle={'cv.monitoringSources.datadog.selectDashboardsPage.dashboardColumnName'}
          defaultItemIcon={'service-datadog'}
          selectedDashboardList={[]}
        />
      )
    )
    expect(container.querySelector('[class*="loadingErrorNoData"]')).not.toBeNull()

    const retryButton = container.querySelector('button')
    if (!retryButton) {
      throw Error('Could not find dashboards to render')
    }
    fireEvent.click(retryButton)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('When api returns data, ensure data is rendered correctly', async () => {
    mockedReturnedValue = {
      ...mockedReturnedValue,
      data: MockData.data
    }
    const { container } = render(
      WrapperComponent(
        <MetricsDashboardList
          manualQueryInputTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          tableItemMapper={tableMapper}
          dashboardsRequest={mockedReturnedValue}
          tableTitle={'cv.monitoringSources.datadog.selectDashboardsPage.dashboardColumnName'}
          defaultItemIcon={'service-datadog'}
          selectedDashboardList={[]}
        />
      )
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const rows = container.querySelectorAll('div[role="row"]')
    expect(rows.length).toBe(11)

    fireEvent.click(rows[2])
    await waitFor(() => expect(container.querySelectorAll('input[checked=""]').length).toBe(1))

    const checkedBox = container.querySelector('input[type="checkbox"]')
    if (!checkedBox) {
      throw Error('checkbox was not rendered.')
    }
    fireEvent.click(checkedBox)
    await waitFor(() => expect(container.querySelectorAll('input[checked=""]').length).toBe(2))

    fireEvent.click(getByText(container, '2'))

    await waitFor(() =>
      expect(refetchMock).toHaveBeenNthCalledWith(2, {
        queryParams: {
          accountId: MockParams.accountId,
          projectIdentifier: MockParams.projectIdentifier,
          orgIdentifier: MockParams.orgIdentifier,
          connectorIdentifier: expect.any(String),
          pageSize: 7,
          offset: 1,
          tracingId: expect.any(String),
          filter: undefined
        }
      })
    )
  })
})
