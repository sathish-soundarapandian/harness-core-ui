import React, { useContext, useState } from 'react'
import { useFormikContext } from 'formik'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'

interface ServiceInstanceTextInputProps {
  serviceInstanceField?: string
  defaultServiceInstance?: string
}

export function ServiceInstanceTextInput({
  defaultServiceInstance,
  serviceInstanceField
}: ServiceInstanceTextInputProps): JSX.Element {
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const { setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { isTemplate, expressions, sourceData } = useContext(SetupSourceTabsContext)
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)

  const [metricInstanceMultiType, setMetricPathMultiType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(serviceInstanceField)
  )
  return isTemplate ? (
    <FormInput.MultiTextInput
      label={<ServiceInstanceLabel />}
      name={CustomMetricFormFieldNames.SERVICE_INSTANCE}
      onChange={(value, _valueType, multiType) => {
        if (multiType !== metricInstanceMultiType) {
          setMetricPathMultiType(multiType)
          if (!value && multiType === MultiTypeInputType.FIXED) {
            setFieldValue(CustomMetricFormFieldNames.SERVICE_INSTANCE, defaultServiceInstance)
          }
        }
        const isServiceInstanceFixed = getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
        if (multiType === MultiTypeInputType.EXPRESSION && isServiceInstanceFixed) {
          setFieldValue(CustomMetricFormFieldNames.SERVICE_INSTANCE, undefined)
        }
      }}
      multiTextInputProps={{
        value: serviceInstanceField,
        expressions,
        multitypeInputValue: metricInstanceMultiType,
        allowableTypes:
          isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression
            ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
      }}
    />
  ) : (
    <FormInput.Text name={CustomMetricFormFieldNames.SERVICE_INSTANCE} label={<ServiceInstanceLabel />} />
  )
}
