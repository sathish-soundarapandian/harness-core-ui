/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Container, Layout, Card } from '@harness/uicore'
import type { CVStepperInterface, StepInterface } from './CVStepper.types'
import { StepTitle } from './components/StepTitle/StepTitle'
import { StepNavButtons } from './components/StepNavButtons/StepNavButtons'
import css from './CVStepper.module.scss'

interface CVStepInterface {
  stepList: StepInterface[]
  selectedStepId?: string
  step: StepInterface
  index: number
  onStepChange?: (id: string) => void
  isStepValid?: (selectedTabId: string) => boolean
  runValidationOnMount?: boolean
  setSelectedStepId: (id: string) => void
}
const CVStep = ({
  stepList,
  selectedStepId,
  isStepValid,
  step,
  index,
  onStepChange,
  setSelectedStepId,
  runValidationOnMount
}: CVStepInterface): JSX.Element => {
  const selectedStepIndex = stepList.map(item => item.id).indexOf(selectedStepId || '')
  const [isValid, setIsValid] = useState<boolean>()
  const isLastStep = selectedStepIndex === stepList.length - 1
  const isCurrent = selectedStepIndex === index

  const onTitleClick = (titleIndex: number): void => {
    setSelectedStepId(stepList[titleIndex].id)
    onStepChange?.(stepList[titleIndex].id)
  }

  const isValidEditMode = runValidationOnMount ? !!isStepValid?.(step.id) : isValid

  const onContinue = (selectedIndex: number, skipValidation = false): void => {
    const validStatus = !!isStepValid?.(step.id)
    if (validStatus || skipValidation) {
      setSelectedStepId(stepList[selectedIndex].id)
      onStepChange?.(stepList[selectedIndex].id)
    }
    setIsValid(validStatus)
  }

  return (
    <>
      <Layout.Vertical key={`${step.id}_vertical`} spacing="medium">
        <StepTitle step={step} index={index} isCurrent={isCurrent} isValid={isValidEditMode} onClick={onTitleClick} />
        {selectedStepIndex > index && (
          <Container data-testid={`preview_${step.id}`} className={css.alignContainerRight}>
            {step.preview ? <>{step.preview}</> : <Text> Preview Text </Text>}
          </Container>
        )}
        {selectedStepIndex === index && (
          <Container className={css.alignContainerRight}>
            <Card data-testid={`panel_${step.id}`} className={css.card}>
              {step.panel}
            </Card>
            <StepNavButtons index={index} onContinue={onContinue} isLastStep={isLastStep} />
          </Container>
        )}
      </Layout.Vertical>
    </>
  )
}

export const CVStepper = (props: React.PropsWithChildren<CVStepperInterface>): React.ReactElement => {
  const { stepList, isStepValid, onStepChange, runValidationOnMount } = props
  const [selectedStepId, setSelectedStepId] = useState(() => stepList[0].id)
  return (
    <Layout.Vertical margin="large">
      {stepList?.map((step, index) => {
        return (
          <CVStep
            key={step.id}
            step={step}
            index={index}
            stepList={stepList}
            selectedStepId={selectedStepId}
            isStepValid={isStepValid}
            setSelectedStepId={setSelectedStepId}
            onStepChange={onStepChange}
            runValidationOnMount={runValidationOnMount}
          />
        )
      })}
    </Layout.Vertical>
  )
}
