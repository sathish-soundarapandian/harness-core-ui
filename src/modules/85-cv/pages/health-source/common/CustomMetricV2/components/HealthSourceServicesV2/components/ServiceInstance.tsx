import React from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Layout, RUNTIME_INPUT_VALUE, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import type { CommonCustomMetricPropertyType } from '../../../CustomMetric.types'
import useCustomMetricV2HelperContext from '../../../hooks/useCustomMetricV2HelperContext'

export default function ServiceInstance<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { values: formValues } = useFormikContext<T>()

  const { getString } = useStrings()

  const { expressions, isConnectorRuntimeOrExpression, isTemplate } = useCustomMetricV2HelperContext()

  const fieldName = `customMetrics.${formValues.selectedCustomMetricIndex}.responseMapping.serviceInstanceJsonPath`

  const optionalServiceInstancePathLabel = `${getString('cv.monitoringSources.serviceInstanceIdentifier')} ${getString(
    'cv.monitoringSources.optionalServiceInstanceLabel'
  )}`

  if (!isTemplate) {
    return (
      <Layout.Vertical margin={{ top: 'medium' }} spacing="normal">
        <ServiceInstanceLabel />
        <FormInput.Text name={fieldName} />
      </Layout.Vertical>
    )
  }

  return (
    <FormInput.MultiTextInput
      key={fieldName}
      name={fieldName}
      label={optionalServiceInstancePathLabel}
      multiTextInputProps={{
        expressions,
        defaultValue: RUNTIME_INPUT_VALUE,
        allowableTypes: isConnectorRuntimeOrExpression
          ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
          : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
      }}
    />
  )
}
