import React from 'react'
import { Container, NoDataCard } from '@harness/uicore'
import emptyData from '@cv/assets/emptyData.svg'

import { useStrings } from 'framework/strings'
import css from '../MetricThreshold.module.scss'

export default function EmptyThresholdsDisplay(): JSX.Element {
  const { getString } = useStrings()

  return (
    <Container className={css.emptyThresholdsContainer} data-testid="emptyThresholdsDisplay">
      <NoDataCard
        containerClassName={css.noThresholdsMessageCard}
        image={emptyData}
        message={getString('cv.metricThresholds.noThresholdsMessage')}
      />
    </Container>
  )
}
