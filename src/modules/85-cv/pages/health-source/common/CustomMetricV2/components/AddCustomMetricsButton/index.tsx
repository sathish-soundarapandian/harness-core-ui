import React from 'react'
import { Button } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { AddCustomMetricButtonProps } from './AddCustomMetricButton.types'

export default function AddCustomMetricButton(props: AddCustomMetricButtonProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <Button
      disabled={props.disabled}
      icon="plus"
      minimal
      intent="primary"
      onClick={props.onClick}
      data-testid="addCustomMetricButton"
    >
      {getString('cv.monitoringSources.addMetric')}
    </Button>
  )
}
