/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './Setup.module.scss'

interface SetupStepsProps {
  activeStepCount?: number
}

interface StepConfig {
  label: string
}

const SetupSteps: React.FC<SetupStepsProps> = ({ activeStepCount }) => {
  const { getString } = useStrings()
  const steps: StepConfig[] = [
    {
      label: getString('ce.commitmentOrchestration.setup.steps.step1Label')
    },
    {
      label: getString('ce.commitmentOrchestration.setup.steps.step2Label')
    },
    {
      label: getString('ce.commitmentOrchestration.setup.steps.step3Label')
    },
    {
      label: getString('review')
    }
  ]
  const activeStep = defaultTo(activeStepCount, 0)

  return (
    <Layout.Horizontal className={css.setupSteps}>
      {steps.map((step, index: number) => {
        return (
          <Container
            key={step.label}
            className={cx(css.stepCont, {
              [css.active]: index === activeStep
            })}
          >
            <Container className={css.stepNumber}>
              <Text font={{ variation: FontVariation.SMALL }}>{index + 1}</Text>
            </Container>
            <Text font={{ variation: FontVariation.H6 }}>{step.label}</Text>
          </Container>
        )
      })}
    </Layout.Horizontal>
  )
}

export default SetupSteps
