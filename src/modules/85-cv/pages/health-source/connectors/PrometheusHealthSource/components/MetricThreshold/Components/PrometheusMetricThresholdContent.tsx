import React from 'react'
import { Card } from '@harness/uicore'
import PrometheusMetricThresholdTab from './Components/PrometheusMetricThresholdTab'
import css from './PrometheusMetricThresholdContent.module.scss'

export default function PrometheusMetricThresholdContent(): JSX.Element {
  return (
    <Card className={css.appDMetricThresholdContentCard}>
      <PrometheusMetricThresholdTab />
    </Card>
  )
}
