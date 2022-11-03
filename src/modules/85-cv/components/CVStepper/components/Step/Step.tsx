/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Container, Layout, Card } from '@harness/uicore'
import type { StepPropsInterface, StepStatusType } from './Step.types'
import { StepTitle } from './components/StepTitle/StepTitle'
import { StepNavButtons } from './components/StepNavButtons/StepNavButtons'
import { StepStatus } from './Step.constants'
import { getStepStatus } from './Step.utils'
import css from './Step.module.scss'

const Step = ({
  stepList,
  selectedStepId,
  isStepValid,
  step,
  index,
  onStepChange,
  setSelectedStepId,
  runValidationOnMount
}: StepPropsInterface): JSX.Element => {
  const selectedStepIndex = stepList.map(item => item.id).indexOf(selectedStepId || '')
  const [stepStatus, setStepStatus] = useState<StepStatusType>(StepStatus.INCONCLUSIVE)
  const isLastStep = selectedStepIndex === stepList.length - 1
  const isCurrent = selectedStepIndex === index
  const isPreviewVisible = selectedStepIndex > index && step.preview

  const onTitleClick = useCallback(
    (titleIndex: number): void => {
      setSelectedStepId(stepList[titleIndex].id)
      onStepChange?.(stepList[titleIndex].id)
    },
    [onStepChange, setSelectedStepId, stepList]
  )

  const onContinue = useCallback(
    (selectedIndex: number, skipValidation = false): void => {
      const validStatus = !!isStepValid?.(step.id)
      if (validStatus || skipValidation) {
        setSelectedStepId(stepList[selectedIndex].id)
        onStepChange?.(stepList[selectedIndex].id)
      }
      setStepStatus(getStepStatus(validStatus))
    },
    [isStepValid, onStepChange, setSelectedStepId, step.id, stepList]
  )

  const stepTitleStatus = useMemo(
    () => (runValidationOnMount ? getStepStatus(!!isStepValid?.(step.id)) : stepStatus),
    [isStepValid, runValidationOnMount, step.id, stepStatus]
  )

  return (
    <>
      <Layout.Vertical key={`${step.id}_vertical`} spacing="medium">
        <StepTitle
          step={step}
          index={index}
          isCurrent={isCurrent}
          stepStatus={stepTitleStatus}
          onClick={onTitleClick}
        />
        {isPreviewVisible && (
          <Container data-testid={`preview_${step.id}`} className={css.alignContainerRight}>
            <>{step.preview}</>
          </Container>
        )}
        {isCurrent && (
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

export default Step
