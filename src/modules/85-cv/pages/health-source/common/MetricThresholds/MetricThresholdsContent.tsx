import React, { ReactNode } from 'react'
import { Card } from '@harness/uicore'
import css from './MetricThresholds.module.scss'

export default function MetricThresholdContent(props: { children?: ReactNode }): JSX.Element {
  return <Card className={css.metricThresholdContentCard}>{props.children}</Card>
}
