/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StepNavButtonsInterface } from '../../CVStepper.types'

export const StepNavButtons = ({ index, isLastStep, onContinue }: StepNavButtonsInterface): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small" padding={{ top: 'xlarge' }}>
      {index > 0 && (
        <Button
          data-testid="backButton"
          variation={ButtonVariation.SECONDARY}
          onClick={() => onContinue(index - 1, true)}
        >
          {getString('back')}
        </Button>
      )}
      <Button
        data-testid="nextButton"
        variation={ButtonVariation.PRIMARY}
        text={isLastStep ? getString('save') : getString('next')}
        onClick={() => onContinue(isLastStep ? index : index + 1)}
      />
    </Layout.Horizontal>
  )
}
