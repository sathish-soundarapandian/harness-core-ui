/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as DynatraceHealthSourceUtils from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import {
  MockDynatraceMetricData,
  DynatraceMockHealthSourceData,
  ServiceListMock,
  ServiceListOptionsMock,
  DynatraceUpdatedHealthSourceMock,
  DynatraceHealthSourceSpecMock
} from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import type { DynatraceFormDataInterface } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import {
  DynatraceHealthSourceFieldNames,
  QUERY_CONTAINS_SERVICE_VALIDATION_PARAM
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.constants'
import { MAPPED_METRICS_LIST_MOCK } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/__tests__/DynatraceCustomMetrics.mock'
import { MockDatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/components/DatadogMetricsDetailsContent/tests/mock'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'

describe('Validate DynatraceHealthSource Utils', () => {
  test('validate mapping health source data to Dynatrace mapping', () => {
    // with list of metrics
    expect(DynatraceHealthSourceUtils.mapHealthSourceToDynatraceMetricData(DynatraceMockHealthSourceData)).toEqual(
      MockDynatraceMetricData
    )
    const propsWithoutMetrics = {
      ...DynatraceMockHealthSourceData,
      healthSourceList: [
        {
          ...DynatraceUpdatedHealthSourceMock,
          spec: {
            ...DynatraceHealthSourceSpecMock,
            metricDefinitions: [],
            serviceName: undefined,
            serviceId: undefined
          }
        }
      ]
    }
    const metricDataWithoutCustomMetrics = {
      ...MockDynatraceMetricData,
      customMetrics: new Map(),
      selectedService: { label: '', value: '' }
    }
    // without metrics and without service name and id
    expect(DynatraceHealthSourceUtils.mapHealthSourceToDynatraceMetricData(propsWithoutMetrics)).toEqual(
      metricDataWithoutCustomMetrics
    )
  })

  test('validate mapping Dynatrace data to health source', () => {
    expect(DynatraceHealthSourceUtils.mapDynatraceMetricDataToHealthSource(MockDynatraceMetricData)).toEqual(
      DynatraceUpdatedHealthSourceMock
    )
    const metricDataWithoutCustomMetrics = { ...MockDynatraceMetricData, customMetrics: new Map() }
    const metricHealthSourceWithoutMetricDefinitions: UpdatedHealthSource = {
      ...DynatraceUpdatedHealthSourceMock,
      spec: { ...DynatraceUpdatedHealthSourceMock.spec, metricDefinitions: [] }
    }
    expect(DynatraceHealthSourceUtils.mapDynatraceMetricDataToHealthSource(metricDataWithoutCustomMetrics)).toEqual(
      metricHealthSourceWithoutMetricDefinitions
    )
  })

  test('validate mapping services to select options', () => {
    expect(DynatraceHealthSourceUtils.mapServiceListToOptions(ServiceListMock)).toEqual(ServiceListOptionsMock)
    expect(
      DynatraceHealthSourceUtils.mapServiceListToOptions([
        {
          displayName: undefined,
          entityId: undefined
        }
      ])
    ).toEqual([
      {
        label: '',
        value: ''
      }
    ])
  })

  test('validate dynatrace metric packs errors', () => {
    const expectedErrors: any = {}
    expectedErrors[DynatraceHealthSourceFieldNames.METRIC_DATA] =
      'cv.monitoringSources.appD.validations.selectMetricPack'
    expectedErrors[DynatraceHealthSourceFieldNames.DYNATRACE_SELECTED_SERVICE] =
      'cv.healthSource.connectors.Dynatrace.validations.selectedService'
    const dataWithNoMetricPackSelected: DynatraceFormDataInterface = {
      ...MockDynatraceMetricData,
      metricData: {},
      selectedService: { label: '', value: '' }
    }
    expect(
      DynatraceHealthSourceUtils.validateMapping(dataWithNoMetricPackSelected, ['a', 'b'], 0, val => val, new Map())
    ).toEqual(expectedErrors)

    // no errors when there is no metric packs, but custom metric is added
    const customMetricsErrorWithoutMetricPacks: any = {}
    const dataWithCustomMetrics: DynatraceFormDataInterface = {
      ...MockDynatraceMetricData,
      metricData: {},
      showCustomMetric: true,
      metricName: 'mock_metric_name',
      sli: true,
      groupName: { label: 'mock_label', value: 'mock_value' },
      metricSelector: 'builtin:service.mock'
    }
    expect(
      DynatraceHealthSourceUtils.validateMapping(dataWithCustomMetrics, ['a', 'b'], 0, val => val, new Map())
    ).toEqual(customMetricsErrorWithoutMetricPacks)
  })

  test('validate custom metric errors', () => {
    const expectedErrors: any = {}
    expectedErrors[DynatraceHealthSourceFieldNames.METRIC_NAME] = 'cv.monitoringSources.metricNameValidation'
    expectedErrors[DynatraceHealthSourceFieldNames.GROUP_NAME] = 'cv.monitoringSources.prometheus.validation.groupName'
    expectedErrors[DynatraceHealthSourceFieldNames.SLI] =
      'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
    expectedErrors[
      DynatraceHealthSourceFieldNames.METRIC_SELECTOR
    ] = `cv.monitoringSources.datadog.validation.queryContains${QUERY_CONTAINS_SERVICE_VALIDATION_PARAM}`
    const dataWithNoMetricPackSelected: DynatraceFormDataInterface = {
      ...MockDynatraceMetricData,
      metricName: '',
      groupName: { label: '', value: '' },
      showCustomMetric: true,
      metricSelector: 'metric_selector_without_required_part',
      sli: false
    }
    expect(
      DynatraceHealthSourceUtils.validateMapping(dataWithNoMetricPackSelected, [], 0, val => val, new Map())
    ).toEqual(expectedErrors)
  })

  test('validate onSubmitDynatraceData', async () => {
    const submitDataMock = jest.fn()
    const mockErrors: any = {}
    mockErrors['mockErrorField'] = 'cv.healthSource.connectors.Dynatrace.validations.selectedService'
    jest.spyOn(DynatraceHealthSourceUtils, 'validateMapping').mockReturnValue(mockErrors)

    const setTouchedMock = jest.fn()
    const validateFormMock = jest.fn()
    const mockFormikProps: any = {
      validateForm: validateFormMock,
      setTouched: setTouchedMock,
      initialValues: {
        ...MockDatadogMetricInfo
      },
      values: {
        ...MockDatadogMetricInfo
      },
      setFieldValue: jest.fn()
    }
    DynatraceHealthSourceUtils.onSubmitDynatraceData(
      mockFormikProps,
      MAPPED_METRICS_LIST_MOCK,
      'mapped_metric_1',
      0,
      ['mapped_metric_1', 'mapped_metric_2'],
      val => val,
      submitDataMock
    )
    expect(setTouchedMock).toHaveBeenCalledTimes(1)
    expect(validateFormMock).toHaveBeenCalledTimes(1)
    // errors exist and submitData should not be called
    expect(submitDataMock).toHaveBeenCalledTimes(0)

    const noErrorsMock: any = {}
    // return no errors
    jest.spyOn(DynatraceHealthSourceUtils, 'validateMapping').mockReturnValue(noErrorsMock)
    // with showCustomMetrics true
    const mockFormikPropsWithShowCustom = {
      ...mockFormikProps,
      initialValues: { ...MockDatadogMetricInfo, showCustomMetric: true },
      values: { ...MockDatadogMetricInfo, showCustomMetric: true }
    }
    DynatraceHealthSourceUtils.onSubmitDynatraceData(
      mockFormikPropsWithShowCustom,
      MAPPED_METRICS_LIST_MOCK,
      'mapped_metric_1',
      0,
      ['mapped_metric_1', 'mapped_metric_2'],
      val => val,
      submitDataMock
    )
    expect(submitDataMock).toHaveBeenCalledWith({
      ...mockFormikPropsWithShowCustom.values,
      customMetrics: MAPPED_METRICS_LIST_MOCK
    })

    // with showCustomMetrics false
    DynatraceHealthSourceUtils.onSubmitDynatraceData(
      mockFormikProps,
      MAPPED_METRICS_LIST_MOCK,
      'mapped_metric_1',
      0,
      ['mapped_metric_1', 'mapped_metric_2'],
      val => val,
      submitDataMock
    )
    expect(submitDataMock).toHaveBeenCalledWith({
      ...mockFormikProps.values,
      customMetrics: new Map()
    })
  })

  test('should validate custom metrics fields', async () => {
    const expectedErrors: any = {}
    expectedErrors[DynatraceHealthSourceFieldNames.METRIC_SELECTOR] =
      'cv.monitoringSources.gco.manualInputQueryModal.validation.query'
    const mockValues: DynatraceFormDataInterface = {
      ...MockDynatraceMetricData,
      metricName: 'mock_metric_name',
      groupName: { label: 'test', value: 'test' },
      showCustomMetric: true,
      isManualQuery: true,
      metricSelector: undefined,
      sli: true
    }
    expect(
      DynatraceHealthSourceUtils.validateDynatraceCustomMetricFields(mockValues, [], 0, {}, val => val, new Map())
    ).toEqual(expectedErrors)

    const expectedErrorsForNonManualQuery: any = {}
    expectedErrorsForNonManualQuery[DynatraceHealthSourceFieldNames.ACTIVE_METRIC_SELECTOR] =
      'cv.monitoringSources.metricValidation'
    expect(
      DynatraceHealthSourceUtils.validateDynatraceCustomMetricFields(
        { ...mockValues, isManualQuery: false },
        [],
        0,
        {},
        val => val,
        new Map()
      )
    ).toEqual(expectedErrorsForNonManualQuery)

    const expectedErrorsForExistingSelectorWithoutRequiredParam: any = {}
    expectedErrorsForExistingSelectorWithoutRequiredParam[
      DynatraceHealthSourceFieldNames.METRIC_SELECTOR
    ] = `cv.monitoringSources.datadog.validation.queryContains${QUERY_CONTAINS_SERVICE_VALIDATION_PARAM}`
    expect(
      DynatraceHealthSourceUtils.validateDynatraceCustomMetricFields(
        { ...mockValues, metricSelector: 'does_not_contain_required_param' },
        [],
        0,
        {},
        val => val,
        new Map()
      )
    ).toEqual(expectedErrorsForExistingSelectorWithoutRequiredParam)
  })

  test('validate mapDynatraceDataToDynatraceForm', async () => {
    expect(
      DynatraceHealthSourceUtils.mapDynatraceDataToDynatraceForm(
        { ...MockDynatraceMetricData, metricName: 'mapped_metric_1' },
        MAPPED_METRICS_LIST_MOCK,
        'mapped_metric_1',
        false
      )
    ).toEqual({
      ...MockDynatraceMetricData,
      aggregator: 'avg',
      serviceInstanceIdentifierTag: 'host',
      identifier: 'mapped_metric_1',
      isCustomCreatedMetric: false,
      continuousVerification: true,
      metric: 'system.cpu.user',
      metricPath: 'mock_metric_path',
      dashboardId: 'mock_dashboard_id',
      metricTags: [
        {
          label: 'system.cpu.user',
          value: 'system.cpu.user'
        },
        {
          label: 'test.metric.1',
          value: 'test.metric.1'
        },
        {
          label: 'test.metric.2',
          value: 'test.metric.2'
        }
      ],
      groupName: {
        label: 'mockGroupName',
        value: 'mockGroupName'
      },
      query: 'avg:system.cpu.user{version}.rollup(avg, 60)',
      sli: false,
      showCustomMetric: false,
      metricName: 'mapped_metric_1',
      failFastThresholds: [],
      ignoreThresholds: []
    })

    const selectedMetric = MAPPED_METRICS_LIST_MOCK.get('mapped_metric_2')
    // case when selected custom metric is changed
    expect(
      DynatraceHealthSourceUtils.mapDynatraceDataToDynatraceForm(
        { ...MockDynatraceMetricData, metricName: 'mapped_metric_1' },
        MAPPED_METRICS_LIST_MOCK,
        'mapped_metric_2',
        false
      )
    ).toEqual({ ...MockDynatraceMetricData, showCustomMetric: false, ...selectedMetric })
  })
})
