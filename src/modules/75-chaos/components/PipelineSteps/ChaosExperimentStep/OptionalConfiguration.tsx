/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ChaosExperimentStepData } from './ChaosExperimentStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<ChaosExperimentStepData>
  readonly?: boolean
  allowableTypes?: AllowedTypes
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const {
    formik: { values: formValues, setFieldValue },
    readonly,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.assertion"
          placeholder={getString('pipeline.utilitiesStep.assertion')}
          label={getString('assertionLabel')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
        />
        {formValues.spec.assertion &&
          getMultiTypeFromValue(formValues.spec.assertion) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formValues.spec.assertion}
              type="String"
              variableName="spec.assertion"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => setFieldValue('spec.assertion', value)}
              isReadonly={readonly}
            />
          )}
      </div>
    </div>
  )
}
