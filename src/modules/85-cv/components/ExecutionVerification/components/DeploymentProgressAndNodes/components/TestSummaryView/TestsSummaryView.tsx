/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import moment from 'moment'
import type { FontProps } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import styles from './TestsSummaryView.module.scss'

export interface TestsSummaryViewProps {
  baselineTestName: string
  baselineTestDate: number
  currentTestName: string
  currentTestDate: number
}

const defaultDateFormat = 'MMM D, YYYY h:mm A'

const primaryFontProps: FontProps = { size: 'normal' }
const secondaryFontProps: FontProps = { weight: 'bold', size: 'small' }

export default function TestsSummaryView({
  baselineTestName,
  baselineTestDate,
  currentTestName,
  currentTestDate
}: TestsSummaryViewProps) {
  const { getString } = useStrings()
  return (
    <Container className={styles.testsSummaryView}>
      <Container className={styles.baselineTest}>
        <Text font={primaryFontProps} className={styles.mainLabel}>
          {getString('pipeline.verification.baselineTest')}
        </Text>
        <Text font={secondaryFontProps}>{baselineTestName || 'none'}</Text>
        <Text font={secondaryFontProps}>
          {getString('pipeline.verification.testsRan')}:
          {(baselineTestDate && moment(baselineTestDate).format(defaultDateFormat)) || 'none'}
        </Text>
      </Container>
      <Container className={styles.separator} />
      <Container>
        <Text font={primaryFontProps} className={styles.mainLabel}>
          {getString('pipeline.verification.currentTest')}
        </Text>
        <Text font={secondaryFontProps}>{currentTestName || 'none'}</Text>
        <Text font={secondaryFontProps}>
          {getString('pipeline.verification.testsRan')}:{' '}
          {(currentTestDate && moment(currentTestDate).format(defaultDateFormat)) || 'none'}
        </Text>
      </Container>
    </Container>
  )
}
