/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormikForm } from '@harness/uicore'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { commonHealthSourceProviderPropsMock } from '@cv/components/CommonMultiItemsSideNav/tests/CommonMultiItemsSideNav.mock'
import {
  CHART_VISIBILITY_ENUM,
  CustomMetricFormFieldNames,
  FIELD_ENUM
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { riskCategoryMock } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/__tests__/CustomMetricFormContainer.mock'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import CommonCustomMetricFormContainer from '../CommonCustomMetricFormContainer'
import type { CommonCustomMetricFormContainerProps } from '../CommonCustomMetricFormContainer.types'
import { initialValues, mockedStackdriverLogSampleData } from './CommonCustomMetricFormContainer.mocks'
import CommonHealthSourceProvider from '../../../CommonHealthSourceContext/CommonHealthSourceContext'
import { shouldAutoBuildChart, shouldShowChartComponent } from '../CommonCustomMetricFormContainer.utils'

const WrapperComponent = (props: CommonCustomMetricFormContainerProps): JSX.Element => {
  return (
    <TestWrapper
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      }}
    >
      <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <FormikForm>
            <CommonCustomMetricFormContainer {...props} />
          </FormikForm>
        </Formik>
      </CommonHealthSourceProvider>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetSampleRawRecord: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS',
        resource: {
          rawRecords: mockedStackdriverLogSampleData
        }
      }
    })
  })),
  useGetSampleMetricData: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS',
        resource: {
          timeSeriesData: mockedStackdriverLogSampleData
        }
      }
    })
  })),
  useGetParamValues: jest.fn().mockImplementation(
    () =>
      ({
        mutate: jest.fn(),
        loading: true,
        error: null
      } as any)
  ),
  useGetRiskCategoryForCustomHealthMetric: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    mutate: jest.fn().mockImplementation(() => {
      return {
        loading: false,
        error: null,
        data: riskCategoryMock,
        refetch: jest.fn()
      }
    })
  }))
}))

describe('Unit tests for CommonCustomMetricFormContainer', () => {
  const initialProps = {
    connectorIdentifier: 'Test',
    onChange: jest.fn(),
    healthSourceConfig: {
      addQuery: {
        label: 'Logs'
      },
      metricPacks: {
        enabled: false
      }
    }
  }
  test('Verify that records are fetched when fetch records button is clicked', async () => {
    const { getAllByText, container, getByText } = render(<WrapperComponent {...initialProps} />)

    // Entering query
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: 'query',
      value: 'Test'
    })

    await act(async () => {
      fireEvent.click(getByText('cv.monitoringSources.commonHealthSource.runQuery'))
    })

    //Verify if charts are present
    await waitFor(() => expect(getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())
    expect(container.getElementsByClassName('StackTraceList--textContainer').length).toBe(1)
  })

  test('should check Run query button is hidden if log indexes is runtime in ELK Health source', async () => {
    render(
      <SetupSourceTabsContext.Provider
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value={{ isTemplate: true, sourceData: { product: { value: HealthSourceTypes.ElasticSearch_Logs } } }}
      >
        <TestWrapper
          pathParams={{
            accountId: '1234_accountId',
            projectIdentifier: '1234_project',
            orgIdentifier: '1234_ORG'
          }}
        >
          <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
            <Formik initialValues={{ ...initialValues, index: '<+input>' }} onSubmit={jest.fn()}>
              <FormikForm>
                <CommonCustomMetricFormContainer
                  {...initialProps}
                  healthSourceConfig={{
                    ...initialProps.healthSourceConfig,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    customMetrics: {
                      queryAndRecords: {
                        enabled: true,
                        titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQueryDescriptionMetrics',
                        queryField: {
                          type: FIELD_ENUM.DROPDOWN,
                          label: 'Log Indexes',
                          identifier: CustomMetricFormFieldNames.INDEX,
                          placeholder: 'Select Log Index',
                          isTemplateSupportEnabled: true,
                          allowCreatingNewItems: true
                        }
                      }
                    }
                  }}
                />
              </FormikForm>
            </Formik>
          </CommonHealthSourceProvider>
        </TestWrapper>
      </SetupSourceTabsContext.Provider>
    )

    const runQueryButton = screen.queryByText('cv.monitoringSources.commonHealthSource.runQuery')

    expect(runQueryButton).not.toBeInTheDocument()
  })

  test('Verify that records are fetched automatically when query is prefilled in edit flow', async () => {
    const propsWhenQueryIsPresent = {
      connectorIdentifier: 'Test',
      onChange: jest.fn(),
      healthSourceConfig: {
        addQuery: {
          label: 'Logs'
        },
        metricPacks: {
          enabled: false
        }
      }
    }
    const { getByText, container } = render(<WrapperComponent {...propsWhenQueryIsPresent} />)

    //Verify if charts are present
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())
    expect(container.getElementsByClassName('StackTraceList--textContainer').length).toBe(1)
  })

  test('should be able to auto build chart when chart visbility is auto and chart section is enabled in healthsource config', async () => {
    const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
    expect(shouldAutoBuildChart(chartConfig)).toEqual(true)
  })

  test('should not auto build chart when chart visbility is Default and chart section is enabled in healthsource config', async () => {
    const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.DEFAULT }
    expect(shouldAutoBuildChart(chartConfig)).toEqual(false)
  })

  test('should not auto build chart when chart visbility is Default and chart section is disabled in healthsource config', async () => {
    const chartConfig = { enabled: false, chartVisibilityMode: CHART_VISIBILITY_ENUM.DEFAULT }
    expect(shouldAutoBuildChart(chartConfig)).toEqual(false)
  })

  test('should show Chart component when chart section is enabled in healthsource config', async () => {
    const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
    const isQueryRuntimeOrExpression = false
    expect(shouldShowChartComponent(chartConfig, isQueryRuntimeOrExpression)).toEqual(true)
  })

  test('should not show Chart component when query is runtime or expression and health source config is enabled', async () => {
    const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
    const isQueryRuntimeOrExpression = true
    expect(shouldShowChartComponent(chartConfig, isQueryRuntimeOrExpression)).toEqual(false)
  })

  test('should not show Chart component when connector is runtime  and health source config is enabled', async () => {
    const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
    const isQueryRuntimeOrExpression = false
    const isConnectorRuntimeOrExpression = true
    expect(shouldShowChartComponent(chartConfig, isQueryRuntimeOrExpression, isConnectorRuntimeOrExpression)).toEqual(
      false
    )
  })

  test('should show Chart component when connector is fixed and query is also fixed and  health source config is enabled', async () => {
    const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
    const isQueryRuntimeOrExpression = false
    const isConnectorRuntimeOrExpression = false
    expect(shouldShowChartComponent(chartConfig, isQueryRuntimeOrExpression, isConnectorRuntimeOrExpression)).toEqual(
      true
    )
  })

  // eslint-disable-next-line jest/no-commented-out-tests
  // test('should not show Chart component when records are not present and chart section is enabled in healthsource config', async () => {
  //   const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
  //   const records = [] as Record<string, any>[]
  //   expect(shouldShowChartComponent(chartConfig, records, false, 'query')).toEqual(false)
  // })

  // eslint-disable-next-line jest/no-commented-out-tests
  // test('should not show Chart component when query is not present', async () => {
  //   const chartConfig = { enabled: true, chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO }
  //   const records = [{ record1: 'record-1' }]
  //   expect(shouldShowChartComponent(chartConfig, records, false, '')).toEqual(false)
  // })
})
