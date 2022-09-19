import React from 'react'
import { Container } from '@harness/uicore'
import { useFormikContext } from 'formik'
import type { CommonCustomMetricPropertyType } from '../../CustomMetric.types'
import { canShowRiskProfile, canShowServiceInstance } from '../../CustomMetric.utils'
import RiskProfileV2 from './components/RiskProfileV2'
import MetricServices from './components/MetricServices'
import ServiceInstance from './components/ServiceInstance'
import css from './HealthSourceServicesV2.module.scss'

export default function HealthSourceServicesV2<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { values: formValues } = useFormikContext<T>()

  const { selectedCustomMetricIndex, customMetrics } = formValues

  return (
    <Container className={css.main}>
      <MetricServices />
      {canShowRiskProfile(customMetrics, selectedCustomMetricIndex) && <RiskProfileV2 />}
      {canShowServiceInstance(customMetrics, selectedCustomMetricIndex) && <ServiceInstance />}
    </Container>
  )
}
