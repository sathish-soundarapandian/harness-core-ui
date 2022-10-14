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
  onStepChange?: (id: string, skipValidation?: boolean) => void
  isStepValid?: (selectedTabId: string) => boolean
  runValidationOnMount?: boolean
}
const CVStep = ({
  stepList,
  selectedStepId,
  isStepValid,
  step,
  index,
  onStepChange,
  runValidationOnMount
}: CVStepInterface): JSX.Element => {
  const selectedStepIndex = stepList.map(item => item.id).indexOf(selectedStepId || '')
  const [isValid, setIsValid] = useState<boolean>()
  const isLastStep = selectedStepIndex === stepList.length - 1
  const isCurrent = selectedStepIndex === index
  const onTitleClick = (titleIndex: number): void => {
    onStepChange?.(stepList[titleIndex].id, true)
  }

  const isValidEditMode = runValidationOnMount ? !!isStepValid?.(step.id) : isValid

  // useEffect(() => {
  //   const ids = stepList.map(item => item.id)
  //   ids.forEach(id => {
  //     const validStatus = !!isStepValid?.(id)
  //     setIsValid(validStatus)
  //   })
  // }, [])

  const onContinue = (selectedIndex: number, skipValidation = false): void => {
    const validStatus = !!isStepValid?.(step.id)
    if (validStatus || skipValidation) {
      onStepChange?.(stepList[selectedIndex].id, skipValidation)
    }
    setIsValid(validStatus)
  }

  return (
    <>
      <Layout.Vertical key={`${step.id}_vertical`} spacing="medium">
        <StepTitle step={step} index={index} isCurrent={isCurrent} isValid={isValidEditMode} onClick={onTitleClick} />
        {selectedStepIndex > index && (
          <Container className={css.alignContainerRight}>
            {step.preview ? <>{step.preview}</> : <Text> Preview Text </Text>}
          </Container>
        )}
        {selectedStepIndex === index && (
          <Container className={css.alignContainerRight}>
            <Card className={css.card}>{step.panel}</Card>
            <StepNavButtons index={index} onContinue={onContinue} isLastStep={isLastStep} />
          </Container>
        )}
      </Layout.Vertical>
    </>
  )
}

export const CVStepper = (props: React.PropsWithChildren<CVStepperInterface>): React.ReactElement => {
  const { stepList, onChange: onStepChange, selectedStepId, isStepValid, runValidationOnMount } = props

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
            onStepChange={onStepChange}
            runValidationOnMount={runValidationOnMount}
          />
        )
      })}
    </Layout.Vertical>
  )
}
