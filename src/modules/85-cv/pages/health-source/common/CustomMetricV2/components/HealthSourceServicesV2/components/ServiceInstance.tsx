import React from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Layout } from '@harness/uicore'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import type { CommonCustomMetricPropertyType } from '../../../CustomMetric.types'

export default function ServiceInstance<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { values: formValues } = useFormikContext<T>()

  return (
    <Layout.Vertical margin={{ top: 'medium' }} spacing="medium">
      <ServiceInstanceLabel />
      <FormInput.Text
        name={`customMetrics.${formValues.selectedCustomMetricIndex}.responseMapping.serviceInstanceJsonPath`}
      />
    </Layout.Vertical>
  )
}
