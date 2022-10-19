/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface StepInterface {
  id: string
  title: string
  panel: React.ReactElement
  preview?: React.ReactElement
}

export interface CVStepperInterface {
  id: string
  stepList: StepInterface[]
  onStepChange?: (id: string) => void
  isStepValid?: (selectedTabId: string) => boolean
  runValidationOnMount?: boolean
}

export interface StepTitleInterface {
  step: StepInterface
  index: number
  isValid?: boolean
  isCurrent: boolean
  onClick: (index: number) => void
}

export interface StepNavButtonsInterface {
  index: number
  isLastStep: boolean
  onContinue: (index: number, skipValidation?: boolean) => void
}
