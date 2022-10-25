/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout } from '@harness/uicore'
import type { CVStepperProps } from './CVStepper.types'
import Step from './components/Step/Step'

export const CVStepper = (props: React.PropsWithChildren<CVStepperProps>): React.ReactElement => {
  const { stepList, isStepValid, onStepChange, runValidationOnMount } = props
  const [selectedStepId, setSelectedStepId] = useState(() => stepList[0]?.id)
  return (
    <Layout.Vertical margin="large" data-testid="CVStepper_main">
      {stepList?.map((step, index) => {
        return (
          <Step
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
