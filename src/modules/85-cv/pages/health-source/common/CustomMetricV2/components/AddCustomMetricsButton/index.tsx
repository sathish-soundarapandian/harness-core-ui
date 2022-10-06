import React from 'react'
import { Button, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { AddCustomMetricButtonProps } from './AddCustomMetricButton.types'

export default function AddCustomMetricButton(props: AddCustomMetricButtonProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <Container>
      <Button
        disabled={props.disabled}
        padding={{ left: 0 }}
        icon="plus"
        minimal
        intent="primary"
        onClick={props.onClick}
        data-testid="addCustomMetricButton"
      >
        {getString('cv.monitoringSources.addMetric')}
      </Button>
    </Container>
  )
}
