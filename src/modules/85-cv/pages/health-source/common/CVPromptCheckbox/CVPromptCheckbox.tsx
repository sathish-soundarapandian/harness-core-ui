import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import CheckboxWithPrompt, { MemoisedCheckBox } from '../CheckboxWithPrompt/CheckboxWithPrompt'
import { isGivenMetricNameContainsThresholds } from '../MetricThresholds/MetricThresholds.utils'
import type { CVPromptCheckboxProps, CommonHealthSourceProperties } from './CVPromptCheckbox.types'

export default function CVPromptCheckbox({
  checkboxName,
  checkboxLabel,
  checked,
  contentText,
  onChange,
  filterRemovedMetricNameThresholds
}: CVPromptCheckboxProps): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues, setFieldValue } = useFormikContext<CommonHealthSourceProperties>()

  const getShowPromptOnUnCheck = useCallback((): boolean => {
    return Boolean(isGivenMetricNameContainsThresholds(formValues, formValues.metricName))
  }, [formValues])

  const handleCVChange = useCallback(
    (updatedValue: boolean, identifier?: string) => {
      if (identifier) {
        setFieldValue(identifier, updatedValue)
        if (!updatedValue && getShowPromptOnUnCheck()) {
          filterRemovedMetricNameThresholds(formValues.metricName)
        }
        // onChange(identifier, updatedValue)
      }
    },
    [filterRemovedMetricNameThresholds, formValues.metricName, setFieldValue, getShowPromptOnUnCheck]
  )

  return (
    <MemoisedCheckBox
      checkboxName={checkboxName}
      checkboxLabel={checkboxLabel ?? getString('cv.monitoredServices.continuousVerification')}
      checked={checked}
      key={checkboxName}
      checkBoxKey={checkboxName}
      contentText={contentText ?? getString('cv.metricThresholds.customMetricsDeletePromptContent')}
      popupTitleText={getString('common.warning')}
      onChange={handleCVChange}
      showPromptOnUnCheck={getShowPromptOnUnCheck()}
    />
  )
}
