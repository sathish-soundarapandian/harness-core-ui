/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CreateCompositeSLOSteps } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'

export interface StepInterface {
  id: string
  title: string
  panel: React.ReactElement
  preview?: React.ReactElement
}

export interface CVStepperInterface {
  id: string
  stepList: StepInterface[]
  onChange?: (id: string) => void
  selectedStepId?: string
  isStepValid?: (selectedTabId: CreateCompositeSLOSteps) => boolean
}

export interface StepTitleInterface {
  step: StepInterface
  index: number
  isDisabled: boolean
  isCompleted: boolean
  onClick: (index: number) => void
}

export interface StepNavButtonsInterface {
  index: number
  isLastStep: boolean
  onContinue: (index: number) => void
}
