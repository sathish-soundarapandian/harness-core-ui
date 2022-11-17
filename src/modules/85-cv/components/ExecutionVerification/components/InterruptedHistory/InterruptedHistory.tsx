/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { InterruptEffectDTO } from 'services/pipeline-ng'
import styles from './InterruptedHistory.module.scss'

interface InterruptedHistory {
  interruptedHistories?: InterruptEffectDTO[]
}

export default function InterruptedHistory(props: InterruptedHistory): JSX.Element {
  const { interruptedHistories } = props
  const { getString } = useStrings()

  const interruptedHistory = interruptedHistories?.[0]
  if (interruptedHistory) {
    return (
      <Container padding={'small'} border={{ radius: 0 }} className={styles.main} background={Color.YELLOW_100}>
        <Text font={{ weight: 'bold' }} color={Color.BLACK}>
          {getString('pipeline.failureStrategies.strategiesLabel.ManualIntervention')}
        </Text>
        <Text color={Color.BLACK} font={{ size: 'small' }}>{`Set to ${interruptedHistory?.interruptType} on ${moment(
          interruptedHistory?.interruptConfig?.issuedBy?.issueTime
        ).format('DD-MMM-YYYY h:mm:ss A')}`}</Text>
      </Container>
    )
  } else {
    return <></>
  }
}
