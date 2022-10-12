/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Container, Layout, Card } from '@harness/uicore'
import type { CVStepperInterface } from './CVStepper.types'
import { StepTitle } from './components/StepTitle/StepTitle'
import { StepNavButtons } from './components/StepNavButtons/StepNavButtons'
import { onChange } from './CVStepper.utils'
import css from './CVStepper.module.scss'

export const CVStepper = (props: React.PropsWithChildren<CVStepperInterface>): React.ReactElement => {
  const { stepList } = props
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)

  return (
    <Layout.Vertical margin="large">
      {stepList.map((step, index) => {
        const isDisabled = selectedStepIndex < index
        const isCompleted = selectedStepIndex <= index
        const isLastStep = selectedStepIndex === stepList.length - 1
        const onTitleClick = (titleIndex: number): void => {
          onChange(titleIndex, stepList.length, setSelectedStepIndex)
        }
        const onContinue = (selectedIndex: number): void => {
          onChange(selectedIndex, stepList.length, setSelectedStepIndex)
        }
        return (
          <>
            <Layout.Vertical key={`${step.id}_vertical`} spacing="medium">
              <StepTitle
                step={step}
                index={index}
                isDisabled={isDisabled}
                isCompleted={isCompleted}
                onClick={onTitleClick}
              />
              {selectedStepIndex > index && (
                <Container className={css.alignContainerRight}>
                  <Text> Preview Text </Text>
                </Container>
              )}
              {selectedStepIndex === index && (
                <Container className={css.alignContainerRight}>
                  <Card className={css.card}>{'Text'}</Card>
                  <StepNavButtons index={index} onContinue={onContinue} isLastStep={isLastStep} />
                </Container>
              )}
            </Layout.Vertical>
          </>
        )
      })}
    </Layout.Vertical>
  )
}
