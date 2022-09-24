import React from 'react'
import type { IOptionProps } from '@blueprintjs/core'
import { Text } from '@harness/uicore'
import { useFormikContext } from 'formik'
import FormikCheckboxGroup from '@cv/components/FormikCheckboxGroup'
import { useStrings } from 'framework/strings'
import type { CommonCustomMetricPropertyType } from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.types'
import { getThresholdTypeOptions } from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.utils'

export default function ThresholdTypes<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { getString } = useStrings()

  const { values: formikValues, errors } = useFormikContext<T>()

  const { selectedCustomMetricIndex, customMetrics } = formikValues

  const currentThresholdValues = customMetrics[selectedCustomMetricIndex]?.analysis?.riskProfile?.thresholdTypes

  const items: IOptionProps[] = getThresholdTypeOptions(getString)

  return (
    <>
      <Text margin={{ bottom: 'small' }}>{getString('cv.monitoringSources.baselineDeviation')}</Text>
      <FormikCheckboxGroup
        items={items}
        name={`customMetrics.${selectedCustomMetricIndex}.analysis.riskProfile.thresholdTypes`}
        values={currentThresholdValues as string[]}
        // TS Ignored inorder to display error for Baseline deviation
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        errorMessage={errors[`baselineDeviation-${selectedCustomMetricIndex}`]}
      />
    </>
  )
}
