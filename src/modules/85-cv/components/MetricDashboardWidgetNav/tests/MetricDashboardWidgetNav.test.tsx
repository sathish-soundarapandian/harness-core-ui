/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { waitFor, render, fireEvent } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Classes } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import MetricDashboardWidgetNav from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav'
import type { StackdriverDashboardDetail } from 'services/cv'
import {
  FieldNames,
  MANUAL_INPUT_QUERY
} from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/components/ManualInputQueryModal/ManualInputQueryModal'
import {
  MockConnectorIdentifier,
  MockDashboards,
  MockWidgetsResponse
} from '@cv/components/MetricDashboardWidgetNav/tests/mock'
import Mock = jest.Mock

describe('unit tests for dashboard widget metric', () => {
  let mockedReturnedValue: UseGetReturn<any, any, any>
  let widgetMapper: Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockedReturnedValue = {
      data: { data: MockWidgetsResponse },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any>
    widgetMapper = jest.fn()
    widgetMapper.mockReturnValueOnce(MockWidgetsResponse[0])
    widgetMapper.mockReturnValueOnce(MockWidgetsResponse[1])
    widgetMapper.mockReturnValueOnce(MockWidgetsResponse[2])
  })
  test(' Ensure that the content is rendered', async () => {
    const mockMetricSelect = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <MetricDashboardWidgetNav
          dashboardDetailsRequest={mockedReturnedValue}
          dashboardWidgetMapper={widgetMapper}
          addManualQueryTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          dashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText('widget_1')).not.toBeNull()
    const firstMetric = getByText('metric_2')
    expect(firstMetric).not.toBeNull()

    if (!firstMetric) {
      throw Error('First metric was not rendered.')
    }
    fireEvent.click(firstMetric)
    await waitFor(() => expect(mockMetricSelect).toHaveBeenCalledTimes(2))
    expect(mockMetricSelect).toHaveBeenNthCalledWith(
      1,
      MockWidgetsResponse[0]?.dataSets?.[0]?.id,
      MockWidgetsResponse[0]?.dataSets?.[0].name,
      MockWidgetsResponse[0]?.dataSets?.[0].query,
      MockWidgetsResponse[0]?.widgetName,
      MockDashboards[0].itemId,
      MockDashboards[0].title
    )
    expect(mockMetricSelect).toHaveBeenNthCalledWith(
      2,
      MockWidgetsResponse[0]?.dataSets?.[1]?.id,
      MockWidgetsResponse[0]?.dataSets?.[1].name,
      MockWidgetsResponse[0]?.dataSets?.[1].query,
      MockWidgetsResponse[0]?.widgetName,
      MockDashboards[0].itemId,
      MockDashboards[0].title
    )
  })

  test('Ensure that when error and no data happens, the component handles it correctly', async () => {
    mockedReturnedValue = {
      error: { data: { detailedMessage: 'mock error' } } as unknown,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any>

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <MetricDashboardWidgetNav
          dashboardDetailsRequest={mockedReturnedValue}
          dashboardWidgetMapper={widgetMapper}
          addManualQueryTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          dashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={jest.fn()}
        />
      </TestWrapper>
    )

    // error case validation, ensure toaster is displayed
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(getByText('mock error')).not.toBeNull())

    await waitFor(() =>
      expect(container.querySelectorAll(`.${Classes.TREE_NODE_LIST}.${Classes.TREE_ROOT} li`).length).toBe(3)
    )

    expect(container.querySelectorAll(`${Classes.TREE_NODE_LIST}`)[1]?.children.length).toBeUndefined()
  })

  test('Ensure that when manual input query is selected and entered, it shows up in the nav', async () => {
    const mockMetricSelect = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <MetricDashboardWidgetNav
          dashboardDetailsRequest={mockedReturnedValue}
          dashboardWidgetMapper={widgetMapper}
          addManualQueryTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          dashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // click on manual input query and expect modal to appear
    fireEvent.click(getByText('cv.monitoringSources.gco.addManualInputQuery'))
    await waitFor(() => expect(document.body.querySelector(`input[name="${FieldNames.METRIC_NAME}"]`)).not.toBeNull())

    // fill out value and submit modal
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: FieldNames.METRIC_NAME,
      value: 'solo-dolo'
    })

    const submitButton = document.body.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('submit button not rendered')
    }
    fireEvent.click(submitButton)

    // expect selected metric prop to be called and the manual input query to be selected
    await waitFor(() => expect(document.body.querySelector(`[class*="${Classes.DIALOG_HEADER}"]`)))
    expect(mockMetricSelect).toHaveBeenNthCalledWith(2, 'solo-dolo', 'solo-dolo', MANUAL_INPUT_QUERY)
    expect(container.querySelector(`.${Classes.TREE_NODE_SELECTED} p`)?.innerHTML).toEqual('solo-dolo')
  })

  test('Ensure that when manual input query can be deleted', async () => {
    const mockMetricSelect = jest.fn()
    const onDeleteManualMetric = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <MetricDashboardWidgetNav
          dashboardDetailsRequest={mockedReturnedValue}
          dashboardWidgetMapper={widgetMapper}
          addManualQueryTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          dashboards={[]}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
          onDeleteManualMetric={onDeleteManualMetric}
          manuallyInputQueries={['manual 101']}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(document.body.querySelector(`[class*="${Classes.DIALOG_HEADER}"]`)))
    expect(container.querySelector(`.${Classes.TREE_NODE_SELECTED} p`)?.innerHTML).toEqual('manual 101')
    // delete metric
    expect(container.querySelectorAll('[data-icon="cross"]')?.length).toEqual(1)
    fireEvent.click(container.querySelector('[data-icon="cross"]')!)
    expect(onDeleteManualMetric).toHaveBeenCalledWith('manual 101')
    expect(container.querySelector(`.${Classes.TREE_NODE_SELECTED} p`)).not.toBeTruthy()
  })

  test('Ensure that when s', async () => {
    const mockMetricSelect = jest.fn()

    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <MetricDashboardWidgetNav
          dashboardDetailsRequest={mockedReturnedValue}
          dashboardWidgetMapper={widgetMapper}
          addManualQueryTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          dashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
  })

  test('Ensure that when only manual input query is provided, it is properly selected in the nav', async () => {
    const mockMetricSelect = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <MetricDashboardWidgetNav<StackdriverDashboardDetail>
          dashboardWidgetMapper={widgetMapper}
          dashboardDetailsRequest={mockedReturnedValue}
          addManualQueryTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
          dashboards={[]}
          manuallyInputQueries={['solo-dolo', 'semi-auto']}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('ul[class*="bp3-tree-node-list"][class*="root"]')?.children.length).toBe(1)
    expect(container.querySelector('ul li[class*="expanded"]')).not.toBeNull()
    expect(mockMetricSelect).toHaveBeenNthCalledWith(1, 'solo-dolo', 'solo-dolo', MANUAL_INPUT_QUERY)
    expect(container.querySelector('li[class*="selected"] p')?.innerHTML).toEqual('solo-dolo')
  })
})
