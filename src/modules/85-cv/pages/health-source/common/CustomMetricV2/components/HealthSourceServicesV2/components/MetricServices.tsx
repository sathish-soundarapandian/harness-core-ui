import React from 'react'
import { FormInput, Text } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { CommonCustomMetricPropertyType } from '../../../CustomMetric.types'

export default function MetricServices<T extends CommonCustomMetricPropertyType>(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<T>()

  const { selectedCustomMetricIndex } = formValues

  return (
    <>
      <Text margin={{ bottom: 'small' }} tooltipProps={{ dataTooltipId: 'assignLabel' }}>
        {getString('cv.monitoredServices.assignLabel')}
      </Text>

      <FormInput.CheckBox
        label={getString('cv.slos.sli')}
        name={`customMetrics.${selectedCustomMetricIndex}.sli.enabled`}
      />
      <FormInput.CheckBox
        label={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
        name={`customMetrics.${selectedCustomMetricIndex}.analysis.liveMonitoring.enabled`}
      />
      <FormInput.CheckBox
        label={getString('cv.monitoredServices.continuousVerification')}
        name={`customMetrics.${selectedCustomMetricIndex}.analysis.deploymentVerification.enabled`}
      />
    </>
  )
}
