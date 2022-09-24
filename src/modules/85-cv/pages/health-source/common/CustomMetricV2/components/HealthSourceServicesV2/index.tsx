import React from 'react'
import { Container, FormError } from '@harness/uicore'
import { useFormikContext } from 'formik'
import type { CommonCustomMetricPropertyType } from '../../CustomMetric.types'
import { canShowRiskProfile, canShowServiceInstance } from '../../CustomMetric.utils'
import RiskProfileV2 from './components/RiskProfileV2'
import MetricServices from './components/MetricServices'
import ServiceInstance from './components/ServiceInstance'
import css from './HealthSourceServicesV2.module.scss'

export default function HealthSourceServicesV2<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { values: formValues, errors } = useFormikContext<T>()

  const { selectedCustomMetricIndex, customMetrics } = formValues

  return (
    <Container className={css.main}>
      <MetricServices />
      {canShowRiskProfile(customMetrics, selectedCustomMetricIndex) && <RiskProfileV2 />}
      {canShowServiceInstance(customMetrics, selectedCustomMetricIndex) && <ServiceInstance />}

      {/* ⭐️ Error display */}
      <FormError
        name={`HealthSourceServicesV2-${selectedCustomMetricIndex}`}
        // TS Ignored inorder to display error for HealthSourceServicesV2
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        errorMessage={errors[`HealthSourceServicesV2-${selectedCustomMetricIndex}`]}
      />
    </Container>
  )
}
