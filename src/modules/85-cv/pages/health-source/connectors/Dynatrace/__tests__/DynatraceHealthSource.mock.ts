/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { DynatraceHealthSourceSpec, DynatraceServiceDTO } from 'services/cv'
import type {
  DynatraceFormDataInterface,
  DynatraceHealthSourceProps,
  DynatraceMetricInfo
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import { DynatraceProductNames } from '@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.constant'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'

export const DynatraceHealthSourceSpecMock: DynatraceHealthSourceSpec = {
  connectorRef: 'dynatraceConnector',
  feature: DynatraceProductNames.APM,
  serviceId: 'mock_service_id',
  serviceName: 'mock_service_name',
  serviceMethodIds: undefined,
  metricPacks: [
    {
      identifier: 'Performance'
    }
  ],
  metricDefinitions: [
    {
      identifier: 'mock_identifier',
      metricName: 'mock_metric_name',
      groupName: 'mock_group_name',
      metricSelector: 'mock_metric_selector',
      isManualQuery: undefined,
      sli: { enabled: true },
      analysis: {
        deploymentVerification: {
          enabled: false
        },
        liveMonitoring: {
          enabled: true
        },
        riskProfile: {
          riskCategory: 'Performance_Throughput',
          thresholdTypes: []
        }
      }
    }
  ]
}

export const DynatraceUpdatedHealthSourceMock: UpdatedHealthSource = {
  name: 'health_source_name',
  identifier: 'dynatrace',
  type: HealthSourceTypes.Dynatrace,
  spec: DynatraceHealthSourceSpecMock
}
export const DynatraceMockHealthSourceData: any = {
  isEdit: true,
  healthSourceList: [DynatraceUpdatedHealthSourceMock],
  monitoringSourceName: 'mock_source_name',
  monitoredServiceIdentifier: 'mock_source_identifier',
  healthSourceName: 'health_source_name',
  healthSourceIdentifier: 'dynatrace',
  type: HealthSourceTypes.Dynatrace,
  connectorRef: 'dynatraceConnector',
  product: { label: DynatraceProductNames.APM, value: DynatraceProductNames.APM }
}

const mockMetricInfosMap: Map<string, DynatraceMetricInfo> = new Map([
  [
    'mock_metric_name',
    {
      metricName: 'mock_metric_name',
      identifier: 'mock_identifier',
      groupName: { label: 'mock_group_name', value: 'mock_group_name' },
      sli: true,
      continuousVerification: false,
      healthScore: true,
      riskCategory: 'Performance_Throughput',
      lowerBaselineDeviation: false,
      higherBaselineDeviation: false,
      isManualQuery: undefined,
      metricSelector: 'mock_metric_selector'
    }
  ]
])

const mockCustomMetricMap: Map<string, DynatraceMetricInfo> = new Map([
  [
    'Dynatrace metric custom',
    {
      metricSelector: 'builtin:service.cpu.perRequest Group 1',
      identifier: 'Dynatrace_metric_custom',
      metricName: 'Dynatrace metric custom',
      riskCategory: '',
      lowerBaselineDeviation: false,
      higherBaselineDeviation: false,
      groupName: { label: 'Group 1', value: 'Group 1' },
      continuousVerification: false,
      healthScore: false,
      sli: true,
      isManualQuery: true
    }
  ]
])

export const MockConnectorName = 'dynatraceConnector'

const templateCustomMetric = new Map()
const templateCustomMetricValue = {
  metricSelector: '<+input>',
  identifier: 'Dynatrace_metric',
  metricName: 'Dynatrace metric',
  riskCategory: 'Infrastructure/INFRA',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: true,
  healthScore: true,
  sli: true
}
templateCustomMetric.set('Dynatrace metric', templateCustomMetricValue)
export const MockTemplateMetricData: DynatraceFormDataInterface = {
  product: { label: 'dynatrace_apm', value: 'dynatrace_apm' },
  healthSourceName: 'Dynatrace Runtime',
  healthSourceIdentifier: 'Dynatrace_Runtime',
  connectorRef: '<+input>',
  isEdit: true,
  selectedService: '<+input>',
  metricPacks: [{ identifier: 'Infrastructure' }, { identifier: 'Performance' }],
  metricData: { Infrastructure: true, Performance: true },
  serviceMethods: [],
  customMetrics: templateCustomMetric,
  ignoreThresholds: [],
  failFastThresholds: []
}

export const MockDynatraceMetricData: DynatraceFormDataInterface = {
  connectorRef: MockConnectorName,
  isEdit: true,
  healthSourceIdentifier: 'dynatrace',
  healthSourceName: 'health_source_name',
  product: { label: DynatraceProductNames.APM, value: DynatraceProductNames.APM },
  selectedService: { label: 'mock_service_name', value: 'mock_service_id' },
  metricPacks: [
    {
      identifier: 'Performance'
    }
  ],
  metricData: {
    Performance: true
  },
  customMetrics: mockMetricInfosMap,
  ignoreThresholds: [],
  failFastThresholds: []
}

export const MockDynatraceMetricDataWithCustomMetric: DynatraceFormDataInterface = {
  product: { label: 'dynatrace_apm', value: 'dynatrace_apm' },
  healthSourceName: 'Dynatrace',
  healthSourceIdentifier: 'Dynatrace',
  connectorRef: 'org.dynatrace',
  isEdit: true,
  selectedService: { label: ':4444', value: 'SERVICE-D739201C4CBBA618' },
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Infrastructure' }],
  metricData: { Performance: true, Infrastructure: true },
  serviceMethods: ['SERVICE_METHOD-F3988BEE84FF7388'],
  customMetrics: mockCustomMetricMap,
  ignoreThresholds: [],
  failFastThresholds: []
}

export const ServiceListMock: DynatraceServiceDTO[] = [
  {
    displayName: 'mock_display_name',
    entityId: 'entity_id'
  }
]

export const ServiceListOptionsMock: SelectOption[] = [{ label: 'mock_display_name', value: 'entity_id' }]

export const DynatraceHealthSourcePropsMock: DynatraceHealthSourceProps = {
  dynatraceFormData: MockDynatraceMetricData,
  onSubmit: jest.fn(),
  onPrevious: jest.fn(),
  connectorIdentifier: 'dynatraceConnector'
}

export const mockUseGetDynatraceServices = {
  data: { data: [] },
  refetch: jest.fn()
}
