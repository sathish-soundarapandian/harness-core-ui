/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { FormikForm } from '@harness/uicore'
import { Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import * as cvServices from 'services/cv'
import * as useDrawerHook from '@cv/hooks/useDrawerHook/useDrawerHook'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { commonHealthSourceProviderPropsMock } from '@cv/components/CommonMultiItemsSideNav/tests/CommonMultiItemsSideNav.mock'
import { TestWrapper } from '@common/utils/testUtils'
import type { CustomMetricFormContainerProps } from '../CustomMetricForm.types'
import CustomMetricFormContainer from '../CustomMetricFormContainer'
import {
  logsTablePayloadMock,
  mockedCustomMetricFormContainerData,
  mockedCustomMetricsFormForLogsTable,
  mockedCustomMetricsFormForLogsTable2,
  mockedCustomMetricsFormForLogsTableConnectorTemplates,
  riskCategoryMock,
  sampleDataResponse,
  sampleRawRecordsMock
} from './CustomMetricFormContainer.mock'
import { validateAddMetricForm } from '../CustomMetricFormContainer.utils'
import CommonHealthSourceProvider from '../components/CommonHealthSourceContext/CommonHealthSourceContext'
import type { GroupedCreatedMetrics } from '../../../CommonHealthSource.types'

function WrapperComponent(props: CustomMetricFormContainerProps): JSX.Element {
  return (
    <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
      <Formik initialValues={props} onSubmit={jest.fn()}>
        <FormikForm>
          <TestWrapper
            path="/account/:accountId/cv/orgs/:orgIdentifier/projects/:projectIdentifier"
            pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
          >
            <CustomMetricFormContainer {...props} />
          </TestWrapper>
        </FormikForm>
      </Formik>
    </CommonHealthSourceProvider>
  )
}

const getString = (key: any): any => {
  return key
}

const refetchMock = jest.fn()

describe('Unit tests for CustomMetricFormContainer', () => {
  const props = {
    ...mockedCustomMetricFormContainerData,
    setMappedMetrics: jest.fn(),
    setCreatedMetrics: jest.fn(),
    setGroupedCreatedMetrics: jest.fn(),
    setNonCustomFeilds: jest.fn()
  } as any

  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetRiskCategoryForCustomHealthMetric')
      .mockImplementation(() => ({ loading: false, error: null, data: riskCategoryMock, refetch: refetchMock } as any))
  })

  test('Ensure CustomMetricFormContainer component loads with the button to add metric', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('common.addName')).toBeInTheDocument())
  })

  test('should be able to click on the add Metric button to open the Add Metric modal', async () => {
    const { getByText, getAllByText } = render(<WrapperComponent {...props} />)
    const addMetricButton = getByText('common.addName')
    await waitFor(() => expect(addMetricButton).toBeInTheDocument())
    userEvent.click(addMetricButton)
    await waitFor(() => expect(getAllByText('common.addName')).toHaveLength(2))
  })

  test('should give proper error message when metric name is not passed', async () => {
    const formData = {
      metricName: '',
      identifier: 'identifier',
      groupName: 'group-1'
    }
    const createdMetrics: string[] = []
    const groupedCreatedMetrics: GroupedCreatedMetrics = {}
    const actualErrors = validateAddMetricForm(formData, getString, createdMetrics, groupedCreatedMetrics)
    expect(actualErrors).toEqual({ metricName: 'fieldRequired' })
  })

  test('should give proper error message when groupName is not passed', async () => {
    const formData = {
      metricName: 'metric1',
      identifier: 'identifier',
      groupName: ''
    }
    const createdMetrics: string[] = []
    const groupedCreatedMetrics: GroupedCreatedMetrics = {}
    const actualErrors = validateAddMetricForm(formData, getString, createdMetrics, groupedCreatedMetrics)
    expect(actualErrors).toEqual({ groupName: 'fieldRequired' })
  })

  test('should give proper error message when identifier is not passed', async () => {
    const formData = {
      metricName: 'metric1',
      identifier: '',
      groupName: 'group-1'
    }
    const createdMetrics: string[] = []
    const groupedCreatedMetrics: GroupedCreatedMetrics = {}
    const actualErrors = validateAddMetricForm(formData, getString, createdMetrics, groupedCreatedMetrics)
    expect(actualErrors).toEqual({ identifier: 'fieldRequired' })
  })

  test('should give proper error message when duplicate metric name is passed', async () => {
    const formData = {
      metricName: 'metric1',
      identifier: 'metric1',
      groupName: 'group1'
    }
    const createdMetrics: string[] = ['metric1']
    const groupedCreatedMetrics: GroupedCreatedMetrics = {
      group1: [
        {
          groupName: {
            label: 'group1',
            value: 'group1'
          },
          metricName: 'metric1'
        }
      ]
    }
    const actualErrors = validateAddMetricForm(formData, getString, createdMetrics, groupedCreatedMetrics)
    expect(actualErrors).toEqual({
      metricName: 'cv.monitoringSources.prometheus.validation.uniqueName'
    })
  })

  describe('Common health source logs table', () => {
    const mockProps = {
      ...mockedCustomMetricsFormForLogsTable,
      setMappedMetrics: jest.fn(),
      setCreatedMetrics: jest.fn(),
      setGroupedCreatedMetrics: jest.fn(),
      setNonCustomFeilds: jest.fn()
    } as any
    test('should test whether the inputs are disabled if the query is not entered and should take correct default value', async () => {
      const { container } = render(<WrapperComponent {...mockProps} />)
      expect(container.querySelector('.jsonSelectorButton')).toBeDisabled()
      expect(container.querySelector('.jsonSelectorButton')).toHaveTextContent('_sourcehost')
    })

    test('should test whether the inputs are enabled if the query present', async () => {
      jest.spyOn(cvServices, 'useGetSampleRawRecord').mockReturnValue({
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            resource: {
              rawRecords: sampleRawRecordsMock
            }
          }
        }),
        loading: false,
        error: null,
        cancel: () => null
      })
      const mockProps2 = {
        ...mockedCustomMetricsFormForLogsTable2,
        setMappedMetrics: jest.fn(),
        setCreatedMetrics: jest.fn(),
        setGroupedCreatedMetrics: jest.fn(),
        setNonCustomFeilds: jest.fn()
      } as any
      const { container } = render(<WrapperComponent {...mockProps2} query="select *" />)

      await act(async () => {
        userEvent.click(screen.getByText('cv.monitoringSources.commonHealthSource.runQuery'))
      })

      await waitFor(() => expect(screen.getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())

      expect(container.querySelector('.jsonSelectorButton')).toHaveTextContent('_sourcehost')

      expect(container.querySelector('.jsonSelectorButton')).not.toBeDisabled()

      act(() => {
        userEvent.click(container.querySelector('.jsonSelectorButton')!)
      })

      expect(document.body.querySelector('.bp3-drawer-header')?.textContent).toBe(
        'cv.monitoringSources.commonHealthSource.logsTable.jsonSelectorDrawerTitlePrefix Identifier service path'
      )
    })
    test('should test whether the API is passed with correct payload', async () => {
      jest.spyOn(cvServices, 'useGetSampleRawRecord').mockReturnValue({
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            resource: {
              rawRecords: sampleRawRecordsMock
            }
          }
        }),
        loading: false,
        error: null,
        cancel: () => null
      })
      const mutateFn = jest.fn().mockImplementation(() => Promise.resolve())
      jest
        .spyOn(cvServices, 'useGetSampleLogData')
        .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

      const mockProps2 = {
        ...mockedCustomMetricsFormForLogsTable2,
        setMappedMetrics: jest.fn(),
        setCreatedMetrics: jest.fn(),
        setGroupedCreatedMetrics: jest.fn(),
        setNonCustomFeilds: jest.fn()
      } as any

      render(
        <SetupSourceTabsContext.Provider
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={{ sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' } } }}
        >
          <WrapperComponent {...mockProps2} query="select *" />
        </SetupSourceTabsContext.Provider>
      )

      await act(async () => {
        userEvent.click(screen.getByText('cv.monitoringSources.commonHealthSource.runQuery'))
      })

      await waitFor(() => expect(screen.getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())

      const fetchSampleDataButton = screen.getByText(
        /cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText/
      )

      act(() => {
        userEvent.click(fetchSampleDataButton)
      })

      expect(mutateFn).toHaveBeenCalledWith(logsTablePayloadMock)
    })

    test('should test whether the loading UI is shown when the call is in progress', async () => {
      jest.spyOn(cvServices, 'useGetSampleRawRecord').mockReturnValue({
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            resource: {
              rawRecords: sampleRawRecordsMock
            }
          }
        }),
        loading: false,
        error: null,
        cancel: () => null
      })
      const mutateFn = jest.fn()
      jest
        .spyOn(cvServices, 'useGetSampleLogData')
        .mockReturnValue({ mutate: mutateFn, loading: true, error: null } as any)

      const mockProps2 = {
        ...mockedCustomMetricsFormForLogsTable2,
        setMappedMetrics: jest.fn(),
        setCreatedMetrics: jest.fn(),
        setGroupedCreatedMetrics: jest.fn(),
        setNonCustomFeilds: jest.fn()
      } as any

      render(
        <SetupSourceTabsContext.Provider
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={{ sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' } } }}
        >
          <WrapperComponent {...mockProps2} query="select *" />
        </SetupSourceTabsContext.Provider>
      )

      await act(async () => {
        userEvent.click(screen.getByText('cv.monitoringSources.commonHealthSource.runQuery'))
      })

      await waitFor(() => expect(screen.getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())

      const processingUI = screen.getByText(/cv.processing/)

      expect(processingUI).toBeInTheDocument()
    })

    test('should test whether error UI is shown if the sample data call fails', async () => {
      jest.spyOn(cvServices, 'useGetSampleRawRecord').mockReturnValue({
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            resource: {
              rawRecords: sampleRawRecordsMock
            }
          }
        }),
        loading: false,
        error: null,
        cancel: () => null
      })
      const mutateFn = jest.fn()
      jest
        .spyOn(cvServices, 'useGetSampleLogData')
        .mockReturnValue({ mutate: mutateFn, loading: false, error: { message: 'Error in sample data call' } } as any)

      const mockProps2 = {
        ...mockedCustomMetricsFormForLogsTable2,
        setMappedMetrics: jest.fn(),
        setCreatedMetrics: jest.fn(),
        setGroupedCreatedMetrics: jest.fn(),
        setNonCustomFeilds: jest.fn()
      } as any

      render(
        <SetupSourceTabsContext.Provider
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={{ sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' } } }}
        >
          <WrapperComponent {...mockProps2} query="select *" />
        </SetupSourceTabsContext.Provider>
      )

      await act(async () => {
        userEvent.click(screen.getByText('cv.monitoringSources.commonHealthSource.runQuery'))
      })

      await waitFor(() => expect(screen.getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())

      const errorUI = screen.getByText(/Error in sample data call/)

      expect(errorUI).toBeInTheDocument()
    })

    test('should test whether logs table is shown if the sample data responds with correct data', async () => {
      const showDrawerMock = jest.fn()

      jest.spyOn(useDrawerHook, 'useDrawer').mockReturnValue({
        showDrawer: showDrawerMock,
        hideDrawer: jest.fn()
      })

      jest.spyOn(cvServices, 'useGetSampleRawRecord').mockReturnValue({
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            resource: {
              rawRecords: sampleRawRecordsMock
            }
          }
        }),
        loading: false,
        error: null,
        cancel: () => null
      })
      const mutateFn = jest.fn().mockResolvedValue({ resource: { logRecords: sampleDataResponse } })

      jest
        .spyOn(cvServices, 'useGetSampleLogData')
        .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

      const mockProps2 = {
        ...mockedCustomMetricsFormForLogsTable2,
        setMappedMetrics: jest.fn(),
        setCreatedMetrics: jest.fn(),
        setGroupedCreatedMetrics: jest.fn(),
        setNonCustomFeilds: jest.fn()
      } as any

      const { container } = render(
        <SetupSourceTabsContext.Provider
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={{ sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' } } }}
        >
          <WrapperComponent {...mockProps2} query="select *" />
        </SetupSourceTabsContext.Provider>
      )

      await act(async () => {
        userEvent.click(screen.getByText('cv.monitoringSources.commonHealthSource.runQuery'))
      })

      await waitFor(() => expect(screen.getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())

      const fetchSampleDataButton = screen.getByText(
        /cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText/
      )

      act(() => {
        userEvent.click(fetchSampleDataButton)
      })

      await waitFor(() => expect(container.querySelector('.TableV2--table')).toBeInTheDocument())

      expect(container.querySelectorAll('.TableV2--row')).toHaveLength(4)

      const firstRow = container.querySelector('.TableV2--clickable:first-child') as Element

      act(() => {
        userEvent.click(firstRow)
      })

      expect(showDrawerMock).toHaveBeenCalledWith({ rowData: sampleDataResponse[0] })
    })

    test('should test whether empty state UI is shown is sample data API responds with empty array', async () => {
      jest.spyOn(cvServices, 'useGetSampleRawRecord').mockReturnValue({
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            resource: {
              rawRecords: sampleRawRecordsMock
            }
          }
        }),
        loading: false,
        error: null,
        cancel: () => null
      })
      const mutateFn = jest.fn().mockResolvedValue({ resource: { logRecords: [] } })

      jest
        .spyOn(cvServices, 'useGetSampleLogData')
        .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

      const mockProps2 = {
        ...mockedCustomMetricsFormForLogsTable2,
        setMappedMetrics: jest.fn(),
        setCreatedMetrics: jest.fn(),
        setGroupedCreatedMetrics: jest.fn(),
        setNonCustomFeilds: jest.fn()
      } as any

      render(
        <SetupSourceTabsContext.Provider
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={{ sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' } } }}
        >
          <WrapperComponent {...mockProps2} query="select *" />
        </SetupSourceTabsContext.Provider>
      )

      await act(async () => {
        userEvent.click(screen.getByText('cv.monitoringSources.commonHealthSource.runQuery'))
      })

      await waitFor(() => expect(screen.getAllByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())

      const fetchSampleDataButton = screen.getByText(
        /cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText/
      )

      act(() => {
        userEvent.click(fetchSampleDataButton)
      })

      await waitFor(() =>
        expect(
          screen.getByText(/cv.monitoringSources.commonHealthSource.logsTable.noSampleAvailable/)
        ).toBeInTheDocument()
      )

      expect(mutateFn).toHaveBeenCalledTimes(1)
      expect(mutateFn).toHaveBeenCalledWith({
        connectorIdentifier: 'Sumo_logic',
        endTime: expect.any(Number),
        healthSourceQueryParams: { serviceInstanceField: '_sourcehost' },
        providerType: 'SUMOLOGIC_LOG',
        query: 'select *',
        startTime: expect.any(Number)
      })
    })

    describe('Logs table templates', () => {
      function TemplatesWrapperComponent(newProps: CustomMetricFormContainerProps): JSX.Element {
        return (
          <SetupSourceTabsContext.Provider
            value={{
              isTemplate: true,
              expressions: [],
              onNext: jest.fn(),
              onPrevious: jest.fn(),
              sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' } }
            }}
          >
            <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
              <Formik initialValues={newProps} onSubmit={jest.fn()}>
                <FormikForm>
                  <TestWrapper
                    path="/account/:accountId/cv/orgs/:orgIdentifier/projects/:projectIdentifier"
                    pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
                  >
                    <CustomMetricFormContainer {...newProps} />
                  </TestWrapper>
                </FormikForm>
              </Formik>
            </CommonHealthSourceProvider>
          </SetupSourceTabsContext.Provider>
        )
      }
      test('should test multitype template inputs are visible if it is a tempalte and query is fixed', () => {
        const { container } = render(<TemplatesWrapperComponent {...mockProps} query="select *" />)

        const templateFixedInput = container.querySelector('.MultiTypeInput--FIXED')

        expect(templateFixedInput).toBeInTheDocument()
      })

      test('should test template inputs are Runtime and fetch logs button is hidden if connector is runtime', () => {
        const mockPropsConnectorTemplateProps = {
          ...mockedCustomMetricsFormForLogsTableConnectorTemplates,
          setMappedMetrics: jest.fn(),
          setCreatedMetrics: jest.fn(),
          setGroupedCreatedMetrics: jest.fn(),
          setNonCustomFeilds: jest.fn()
        } as any
        const { container } = render(
          <SetupSourceTabsContext.Provider
            value={{
              isTemplate: true,
              expressions: [],
              onNext: jest.fn(),
              onPrevious: jest.fn(),
              sourceData: { sourceType: 'SumoLogic', product: { value: 'SUMOLOGIC_LOG' }, connectorRef: '<+input>' }
            }}
          >
            <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
              <Formik initialValues={mockPropsConnectorTemplateProps} onSubmit={jest.fn()}>
                <FormikForm>
                  <TestWrapper
                    path="/account/:accountId/cv/orgs/:orgIdentifier/projects/:projectIdentifier"
                    pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
                  >
                    <CustomMetricFormContainer {...mockPropsConnectorTemplateProps} />
                  </TestWrapper>
                </FormikForm>
              </Formik>
            </CommonHealthSourceProvider>
          </SetupSourceTabsContext.Provider>
        )

        const fetchSampleDataButton = screen.queryByText(
          /cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText/
        )

        const templateFixedInput = container.querySelector('.MultiTypeInput--FIXED')
        const templateRuntimeInput = container.querySelector('.MultiTypeInput--RUNTIME')

        expect(fetchSampleDataButton).not.toBeInTheDocument()
        expect(templateFixedInput).not.toBeInTheDocument()
        expect(templateRuntimeInput).toBeInTheDocument()
      })

      test('should test runtime inputs are rendered and fetch logs button is hidden, if query is a runtime', () => {
        const { container } = render(<TemplatesWrapperComponent {...mockProps} query="<+input>" />)

        const templateFixedInput = container.querySelector('.MultiTypeInput--FIXED')
        const templateRuntimeInput = container.querySelector('.MultiTypeInput--RUNTIME')

        const fetchSampleDataButton = screen.queryByText(
          /cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText/
        )

        expect(fetchSampleDataButton).not.toBeInTheDocument()
        expect(templateFixedInput).not.toBeInTheDocument()
        expect(templateRuntimeInput).toBeInTheDocument()
      })
    })
  })
})
