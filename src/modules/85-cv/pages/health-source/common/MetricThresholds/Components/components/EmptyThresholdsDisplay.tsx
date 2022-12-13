import React from 'react'
import { Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from '../MetricThreshold.module.scss'

export default function EmptyThresholdsDisplay(): JSX.Element {
  const { getString } = useStrings()

  return (
    <Container className={css.emptyThresholdsContainer} data-testid="emptyThresholdsDisplay">
      <Text font={{ variation: FontVariation.BODY }}>{getString('cv.metricThresholds.noThresholdsMessage')}</Text>
    </Container>
  )
}
