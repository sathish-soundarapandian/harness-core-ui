/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type Highcharts from 'highcharts'
import type { SelectOption } from '@harness/uicore'
import type { MetricGraph, MetricOnboardingGraph, ServiceLevelIndicatorDTO, TimeGraphResponse } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import type { MetricNames } from '../../common/SLI/SLI.types'

export interface SLOTargetChartProps {
  topLabel?: JSX.Element
  bottomLabel?: JSX.Element
  dataPoints?: Highcharts.SeriesColumnOptions['data']
  secondaryDataPoints?: Highcharts.SeriesColumnOptions['data']
  customChartOptions?: Highcharts.Options
}

export interface SLOTargetChartWithAPIGetSliGraphProps extends SLOTargetChartProps {
  serviceLevelIndicator: ServiceLevelIndicatorDTO
  monitoredServiceIdentifier?: string
  sliGraphData?: TimeGraphResponse
  loading?: boolean
  error?: string
  retryOnError: (serviceLevelIndicator: ServiceLevelIndicatorDTO, monitoredServiceIdentifier?: string) => void
  debounceFetchSliGraphData?: (
    serviceLevelIndicator: ServiceLevelIndicatorDTO,
    monitoredServiceIdentifier?: string
  ) => Promise<void>
  showMetricChart?: boolean
  showSLIMetricChart?: boolean
  metricChart?: {
    data?: MetricOnboardingGraph
    error?: string
    loading?: boolean
    retryOnError: () => void
  }
  metricsNames?: MetricNames
  setMetricsNames?: React.Dispatch<React.SetStateAction<MetricNames>>
}

export interface GetMetricTitleAndLoadingProps {
  getString: UseStringsReturn['getString']
  eventType?: string
  metricGraphs?: { [key: string]: MetricGraph }
  goodRequestMetric?: string
  validRequestMetric: string
  metricLoading?: boolean
  activeGoodMetric?: SelectOption
  activeValidMetric?: SelectOption
}

export interface GetMetricTitleAndLoadingValues {
  goodRequestMetricLoading?: boolean
  goodRequestMetricTitle?: string
  validRequestMetricLoading?: boolean
  validRequestMetricTitle: string
  metricPercentageGraphTitle?: string
}
