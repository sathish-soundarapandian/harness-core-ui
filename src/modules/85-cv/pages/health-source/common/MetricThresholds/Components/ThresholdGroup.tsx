import React from 'react'
import { FormInput, SelectOption } from '@harness/uicore'
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
  replaceFn,
  groupedCreatedMetrics
}: ThresholdGroupType): JSX.Element {
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
