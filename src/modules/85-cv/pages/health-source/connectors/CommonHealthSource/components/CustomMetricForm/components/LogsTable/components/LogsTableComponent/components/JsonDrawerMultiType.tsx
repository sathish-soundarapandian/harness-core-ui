import React, { useContext } from 'react'
import { AllowedTypes, ExpressionAndRuntimeType, MultiTypeInputType } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { isMultiTypeRuntime } from '@common/utils/utils'
import JsonSelectorButton, { JsonSelectorButtonProps } from './JsonSelectorButton'

interface JsonDrawerMultiTypeProps {
  name: keyof CommonCustomMetricFormikInterface
  label: string
  value: string
  key?: string
  displayText: string
  disabled?: boolean
  className?: string
  onClick: (name: string, label: string) => void
  multiType: MultiTypeInputType
  setMultiType: (fieldName: keyof CommonCustomMetricFormikInterface, updatedValue: MultiTypeInputType) => void
}

const JsonDrawerMultiType = ({
  name,
  value,
  onClick,
  displayText,
  label,
  disabled,
  className,
  multiType,
  setMultiType
}: JsonDrawerMultiTypeProps): JSX.Element => {
  const { expressions, sourceData } = useContext(SetupSourceTabsContext)
  const { setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()

  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()

  const allowedTypes =
    isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression
      ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
      : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]

  return (
    <ExpressionAndRuntimeType<JsonSelectorButtonProps>
      name={name}
      value={value}
      key={`${multiType}`}
      allowableTypes={allowedTypes as AllowedTypes}
      expressions={expressions}
      multitypeInputValue={multiType}
      onChange={(updatedValue, _, type): void => {
        if (type !== multiType) {
          setMultiType?.(name, type)
        }

        if (isMultiTypeRuntime(type) || type === MultiTypeInputType.EXPRESSION) {
          setFieldValue(name, updatedValue)
        } else if (type === MultiTypeInputType.FIXED) {
          setFieldValue(name, undefined)
        }
      }}
      fixedTypeComponentProps={{
        onClick: () => onClick(name, label),
        displayText: displayText,
        icon: 'plus',
        isDisabled: disabled,
        className: className
      }}
      fixedTypeComponent={JsonSelectorButton}
    />
  )
}

export default JsonDrawerMultiType
