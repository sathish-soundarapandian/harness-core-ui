/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'

import { SelectOption, FormInput, AllowedTypes } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { PolicyStepFormData } from './PolicyStepTypes'
import { MultiTypePolicySetSelector } from './PolicySets/MultiTypePolicySetSelector/MultiTypePolicySetSelector'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const entityTypeOptions: SelectOption[] = [{ label: 'Custom', value: 'Custom' }]

export default function BasePolicyStep(props: {
  formik: FormikProps<PolicyStepFormData>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { isNewStep, readonly, stepViewType, allowableTypes } = props

  const [entityType, setEntityType] = useState<string | number | symbol>('Custom')
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <NameId
            nameLabel={getString('pipelineSteps.stepNameLabel')}
            inputGroupProps={{ disabled: readonly }}
            identifierProps={{ isIdentifierEditable: isNewStep && !readonly }}
          />
        </div>
      )}
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={readonly}
          className={stepCss.duration}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            expressions,
            disabled: readonly
          }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.Select
          name="spec.type"
          label={getString('common.entityType')}
          disabled={readonly}
          onChange={/* istanbul ignore next */ option => setEntityType(option?.value)}
          items={entityTypeOptions}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.alignStart)}>
        <MultiTypePolicySetSelector
          name="spec.policySets"
          label={getString('common.policiesSets.policyset')}
          expressions={expressions}
          allowableTypes={allowableTypes}
          disabled={readonly}
        />
      </div>
      {entityType === 'Custom' && (
        <div className={cx(stepCss.formGroup, stepCss.alignStart)}>
          <MultiTypeFieldSelector
            name="spec.policySpec.payload"
            label={getString('common.payload')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            disableTypeSelection={readonly}
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <MonacoTextField
                    name={'spec.policySpec.payload'}
                    expressions={expressions}
                    height={300}
                    disabled={readonly}
                    fullScreenAllowed
                    fullScreenTitle={getString('common.payload')}
                  />
                )
              }
            }
          >
            <MonacoTextField
              name={'spec.policySpec.payload'}
              expressions={expressions}
              height={300}
              disabled={readonly}
              fullScreenAllowed
              fullScreenTitle={getString('common.payload')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
    </>
  )
}
