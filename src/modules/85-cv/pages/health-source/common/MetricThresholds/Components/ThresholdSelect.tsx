import React, { useEffect } from 'react'
import { FormInput } from '@harness/uicore'
import { useFormikContext } from 'formik'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import type { ThresholdSelectProps } from '../MetricThresholds.types'

export default function ThresholdSelect(props: ThresholdSelectProps): JSX.Element {
  const { setFieldTouched } = useFormikContext<AppDynamicsFomikFormInterface>()

  useEffect(() => {
    setFieldTouched(props.name, true)
  }, [props.name, setFieldTouched])

  return <FormInput.Select {...props} usePortal></FormInput.Select>
}
