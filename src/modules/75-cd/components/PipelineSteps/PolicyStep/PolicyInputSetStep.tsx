/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { PolicyStepData } from './PolicyStepTypes'
import { MultiTypePolicySetSelector } from './PolicySets/MultiTypePolicySetSelector/MultiTypePolicySetSelector'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function PolicyInputSetStep(props: {
  readonly?: boolean
  template?: PolicyStepData
  path?: string
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { readonly, template, path, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {getMultiTypeFromValue(/* istanbul ignore next */ template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
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
      )}
      {getMultiTypeFromValue(/* istanbul ignore next */ template?.spec?.policySets) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.alignStart)}>
          <MultiTypePolicySetSelector
            name={`${prefix}spec.policySets`}
            label={getString('common.policiesSets.policyset')}
            expressions={expressions}
            allowableTypes={allowableTypes}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(/* istanbul ignore next */ template?.spec?.policySpec?.payload) ===
        MultiTypeInputType.RUNTIME && (
        <div
          className={cx(stepCss.formGroup, stepCss.alignStart)}
          onKeyDown={
            /* istanbul ignore next */ event => {
              if (event.key === 'Enter') {
                event.stopPropagation()
              }
            }
          }
        >
          <MultiTypeFieldSelector
            name={`${prefix}spec.policySpec.payload`}
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
                    name={`${prefix}spec.policySpec.payload`}
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
              name={`${prefix}spec.policySpec.payload`}
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
