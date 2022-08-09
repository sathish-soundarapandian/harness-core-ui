import React, { useContext, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormInput, SelectOption } from '@harness/uicore'
import { AppDMetricThresholdContext } from '@cv/pages/health-source/connectors/AppDynamics/Components/AppDMetricThreshold/AppDMetricThresholdConstants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import ThresholdSelect from './ThresholdSelect'
import { getGroupDropdownOptions, isGroupTransationTextField } from '../MetricThresholds.utils'
import { MetricTypeValues } from '../MetricThresholds.constants'
import type { ThresholdGroupType } from '../MetricThresholds.types'

export default function ThresholdGroup({
  name,
  metricType,
  index,
  handleTransactionUpdate,
  placeholder,
  replaceFn
}: ThresholdGroupType): JSX.Element {
  const { groupedCreatedMetrics } = useContext(AppDMetricThresholdContext)
  const { setFieldTouched } = useFormikContext<AppDynamicsFomikFormInterface>()

  useEffect(() => {
    setFieldTouched(name, true)
  }, [name, setFieldTouched])

  return isGroupTransationTextField(metricType) ? (
    <FormInput.Text
      placeholder={placeholder}
      style={{ marginTop: 'medium' }}
      name={name}
      disabled={!metricType}
      data-testid="GroupInput"
    />
  ) : (
    <ThresholdSelect
      items={getGroupDropdownOptions(groupedCreatedMetrics)}
      name={name}
      onChange={({ value }: SelectOption) => {
        if (metricType === MetricTypeValues.Custom) {
          handleTransactionUpdate(index, value as string, replaceFn)
        }
      }}
      disabled={!metricType}
    />
  )
}
