import React from 'react'
import { Container } from '@harness/uicore'
import { useFormikContext } from 'formik'
import type { CommonCustomMetricPropertyType } from '../../CustomMetric.types'
import { canShowServiceInstance } from '../../CustomMetric.utils'
import SelectHealthSourceServices from '../../../SelectHealthSourceServices/SelectHealthSourceServices'
import useCustomMetricV2HelperContext from '../../hooks/useCustomMetricV2HelperContext'
import ServiceInstance from './components/ServiceInstance'
import css from './HealthSourceServicesV2.module.scss'

export default function HealthSourceServicesV2<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { values: formValues } = useFormikContext<T>()

  const { metricPacksResponse } = useCustomMetricV2HelperContext()

  const { selectedCustomMetricIndex, customMetrics } = formValues

  const fieldNames = {
    sli: `customMetrics.${selectedCustomMetricIndex}.sli.enabled`,
    serviceHealth: `customMetrics.${selectedCustomMetricIndex}.analysis.liveMonitoring.enabled`,
    deploymentVerification: `customMetrics.${selectedCustomMetricIndex}.analysis.deploymentVerification.enabled`,
    riskProfileCategory: `customMetrics.${selectedCustomMetricIndex}.analysis.riskProfile.category`,
    higherBaselineDeviation: `customMetrics.${selectedCustomMetricIndex}.analysis.higherBaselineDeviation`,
    lowerBaselineDeviation: `customMetrics.${selectedCustomMetricIndex}.analysis.lowerBaselineDeviation`
  }

  const { enabled: isSliEnabled } = customMetrics?.[selectedCustomMetricIndex]?.sli || {}
  const { deploymentVerification, liveMonitoring, riskProfile } =
    customMetrics?.[selectedCustomMetricIndex]?.analysis || {}

  return (
    <Container className={css.main}>
      <SelectHealthSourceServices
        key={customMetrics?.[selectedCustomMetricIndex]?.identifier}
        values={{
          sli: Boolean(isSliEnabled),
          healthScore: liveMonitoring?.enabled,
          continuousVerification: deploymentVerification?.enabled,
          riskCategory: riskProfile?.category
        }}
        metricPackResponse={metricPacksResponse}
        fieldNames={fieldNames}
        hideServiceIdentifier
      />

      {canShowServiceInstance(customMetrics, selectedCustomMetricIndex) && <ServiceInstance />}
    </Container>
  )
}
