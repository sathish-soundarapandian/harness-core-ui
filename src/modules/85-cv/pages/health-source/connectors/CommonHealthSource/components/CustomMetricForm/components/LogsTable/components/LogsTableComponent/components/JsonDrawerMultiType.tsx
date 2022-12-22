import React, { useContext, useEffect, useState } from 'react'
import {
  AllowedTypes,
  ExpressionAndRuntimeType,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { useFormikContext } from 'formik'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  getIsConnectorRuntimeOrExpression,
  getIsQueryRuntimeOrExpression
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { isMultiTypeRuntime } from '@common/utils/utils'
import JsonSelectorButton, { JsonSelectorButtonProps } from './JsonSelectorButton'

interface JsonDrawerMultiTypeProps {
  name: string
  label: string
  value: string
  key?: string
  displayText: string
  disabled?: boolean
  className?: string
  onClick: (name: string, label: string) => void
}

const JsonDrawerMultiType = ({
  name,
  value,
  onClick,
  displayText,
  label,
  disabled,
  className
}: JsonDrawerMultiTypeProps): JSX.Element => {
  const [multiType, setMultiType] = useState(() => {
    return getMultiTypeFromValue(value)
  })

  const { expressions, sourceData } = useContext(SetupSourceTabsContext)
  const { values, setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()

  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)
  const isQueryRuntimeOrExpression = getIsQueryRuntimeOrExpression(values.query)

  const allowedTypes =
    isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression
      ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
      : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]

  useEffect(() => {
    if ((isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression) && multiType === MultiTypeInputType.FIXED) {
      setMultiType(MultiTypeInputType.RUNTIME)
      setFieldValue(name, RUNTIME_INPUT_VALUE)
    }
  }, [isConnectorRuntimeOrExpression, isQueryRuntimeOrExpression])

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
          setMultiType?.(type)
        }

        if (isMultiTypeRuntime(type)) {
          setFieldValue(name, updatedValue)
        } else if (type === MultiTypeInputType.EXPRESSION) {
          setMultiType?.(MultiTypeInputType.EXPRESSION)
        } else if (type === MultiTypeInputType.FIXED) {
          setFieldValue(name, undefined)
        }
      }}
      fixedTypeComponentProps={{
        onClick: () => onClick(name, label),
        displayText: displayText,
        icon: 'plus',
        disabled: disabled,
        className: className
      }}
      fixedTypeComponent={JsonSelectorButton}
    />
  )
}

export default React.memo(JsonDrawerMultiType)
