import React from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Text, FontVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { CloudWatchFormType } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.types'

export default function ExpressionTextbox(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<CloudWatchFormType>()

  const { selectedCustomMetricIndex } = formValues

  return (
    <>
      <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.FORM_HELP }}>
        {getString('cv.query')}
      </Text>
      <FormInput.TextArea name={`customMetrics.${selectedCustomMetricIndex}.expression`} />
    </>
  )
}
