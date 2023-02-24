import React from 'react'
import { useFormikContext } from 'formik'
import { getCanShowMetricThresholds } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type {
  CommonHealthSourceConfigurations,
  GroupedCreatedMetrics,
  HealthSourceConfig
} from '../../CommonHealthSource.types'
import MetricThresholdProvider from './MetricThresholdProvider'

export interface MetricThresholdContainerProps {
  healthSourceConfig: HealthSourceConfig
  groupedCreatedMetrics: GroupedCreatedMetrics
}

export default function MetricThresholdContainer(props: MetricThresholdContainerProps): JSX.Element {
  const { healthSourceConfig, groupedCreatedMetrics } = props
  const { values: formValues } = useFormikContext<CommonHealthSourceConfigurations>()
  const isShowMetricThreshold = getCanShowMetricThresholds({
    isMetricThresholdConfigEnabled: Boolean(healthSourceConfig?.metricThresholds?.enabled),
    isMetricPacksEnabled: Boolean(healthSourceConfig?.metricPacks?.enabled),
    groupedCreatedMetrics
  })

  if (isShowMetricThreshold) {
    return (
      <MetricThresholdProvider
        formikValues={formValues}
        groupedCreatedMetrics={groupedCreatedMetrics}
        metricPacks={[]}
        isOnlyCustomMetricHealthSource={!healthSourceConfig?.metricPacks?.enabled}
      />
    )
  } else {
    return <></>
  }
}
