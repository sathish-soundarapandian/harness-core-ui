/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './StepLabel.module.scss'

export interface StepLabelProps {
  stepNumber: number
  totalSteps: number
}

const StepNumberColoring = [
  {
    backgroundColor: 'var(--green-200)',
    color: '#1E5C1F'
  },
  {
    backgroundColor: 'var(--primary-3)',
    color: 'var(--primary-8)'
  },
  {
    backgroundColor: '#E1D0FF',
    color: '#592BAA'
  }
]

export function StepLabel(props: StepLabelProps): JSX.Element {
  const { stepNumber, totalSteps } = props
  const { getString } = useStrings()
  if (stepNumber > StepNumberColoring.length) return <Container className="invalidIndex" />
  return (
    <Text className={css.main} style={StepNumberColoring[stepNumber - 1]}>{`${getString(
      'step'
    )} ${stepNumber} ${getString('of')} ${totalSteps}`}</Text>
  )
}
