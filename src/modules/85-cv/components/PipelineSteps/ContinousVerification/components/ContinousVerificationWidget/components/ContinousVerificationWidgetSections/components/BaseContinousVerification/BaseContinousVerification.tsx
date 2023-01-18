/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { AllowedTypes, FormInput } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import Card from '@cv/components/Card/Card'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function BaseContinousVerification(props: {
  formik: FormikProps<ContinousVerificationData>
  isNewStep?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { isNewStep = true, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Card>
      <>
        {stepViewType !== StepViewType.Template && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.InputWithIdentifier
              isIdentifierEditable={isNewStep}
              inputLabel={getString('pipelineSteps.stepNameLabel')}
            />
          </div>
        )}
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name="timeout"
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
          />
        </div>
      </>
    </Card>
  )
}
