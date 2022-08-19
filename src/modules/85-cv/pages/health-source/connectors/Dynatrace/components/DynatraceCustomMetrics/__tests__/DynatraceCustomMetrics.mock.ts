/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type {
  DynatraceCustomMetricsProps,
  CreatedMetricsWithSelectedIndex,
  SelectedAndMappedMetrics
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.types'
import type { DynatraceMetricInfo } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'

export const DEFAULT_METRIC_NAME = 'mock_default_metric_name'
export const CREATED_METRICS_WITH_DEFAULT_METRIC_MOCK: CreatedMetricsWithSelectedIndex = {
  createdMetrics: [DEFAULT_METRIC_NAME],
  selectedMetricIndex: 0
}

export const MAPPED_METRICS_LIST_MOCK: Map<string, DynatraceMetricInfo> = new Map([
  [
    'mapped_metric_1',
    {
      identifier: 'mapped_metric_1',
      metricSelector: 'metric_selector_mock',
      sli: true,
      healthScore: true,
      continuousVerification: true,
      metricName: 'mapped_metric_1'
    }
  ],
  [
    'mapped_metric_2',
    {
      identifier: 'mapped_metric_2',
      metricSelector: '',
      sli: true,
      healthScore: true,
      continuousVerification: true,
      metricName: 'mapped_metric_2'
    }
  ]
])

export const SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK: SelectedAndMappedMetrics = {
  selectedMetric: DEFAULT_METRIC_NAME,
  mappedMetrics: new Map([
    [
      DEFAULT_METRIC_NAME,
      {
        identifier: DEFAULT_METRIC_NAME,
        metricSelector: '',
        sli: true,
        healthScore: true,
        continuousVerification: true,
        metricName: DEFAULT_METRIC_NAME,
        isNew: true
      }
    ]
  ])
}

export const DYNATRACE_CUSTOM_METRICS_PROPS_MOCK: DynatraceCustomMetricsProps = {
  formikSetField: jest.fn(),
  metricValues: {
    identifier: 'mapped_metric_1',
    metricSelector: 'metric_selector_mock',
    sli: true,
    healthScore: true,
    continuousVerification: true,
    metricName: 'mapped_metric_1'
  },
  mappedMetrics: MAPPED_METRICS_LIST_MOCK,
  selectedMetric: 'mapped_metric_1',
  connectorIdentifier: 'mock_connector',
  selectedServiceId: 'mock_service_id'
}

export const DYNATRACE_METRICS_SELECTORS_MOCK = [
  {
    displayName: 'metric_selector_1',
    metricId: '1'
  },
  {
    displayName: 'metric_selector_2',
    metricId: '2'
  }
]
export const DYNATRACE_METRICS_SELECTORS_WITH_NO_IDS_MOCK = [
  {
    displayName: 'metric_selector_1',
    metricId: undefined
  },
  {
    displayName: 'metric_selector_2',
    metricId: undefined
  }
]
export const DYNATRACE_METRIC_OPTIONS_MOCK: SelectOption[] = [
  {
    value: '1',
    label: '1'
  },
  {
    value: '2',
    label: '2'
  }
]
export const DYNATRACE_METRIC_OPTIONS_WITH_NO_VALUES_MOCK: SelectOption[] = [
  {
    value: '',
    label: ''
  },
  {
    value: '',
    label: ''
  }
]
