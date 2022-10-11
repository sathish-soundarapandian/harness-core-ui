/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'

import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, AllowedTypes, FormInput } from '@wings-software/uicore'
import { get, defaultTo, isArray } from 'lodash-es'
import cx from 'classnames'
import { FieldArray } from 'formik'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { UpdateReleaseRepoFormData, UpdateReleaseRepoStepData } from './UpdateReleaseRepo'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './UpdateReleaseRepo.module.scss'

export interface UpdateReleaseRepoInputStepProps {
  initialValues: UpdateReleaseRepoFormData
  onUpdate?: (data: UpdateReleaseRepoFormData) => void
  onChange?: (data: UpdateReleaseRepoFormData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: UpdateReleaseRepoStepData
  path?: string
}

const scriptOutputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Secret', value: 'Secret' }
]

export default function UpdateReleaseRepoInputStep(props: UpdateReleaseRepoInputStepProps): React.ReactElement {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = defaultTo(path, '')
  return (
    <FormikForm>
      {getMultiTypeFromValue(get(template, 'timeout', '')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}.timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
          />
        </div>
      )}

      {isArray(get(template, 'spec.variables', [])) && get(template, 'spec.variables', []).length ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.variables"
            label={getString('common.variables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.variables"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.environmentVarHeader}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {template?.spec?.variables?.map((type, i: number) => {
                      return (
                        <div className={css.environmentVarHeader} key={type.value}>
                          <FormInput.Text
                            name={`${prefix}.spec.variables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />
                          <FormInput.Select
                            items={scriptOutputType}
                            name={`${prefix}.spec.variables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          <FormInput.MultiTextInput
                            name={`${prefix}.spec.variables[${i}].value`}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: readonly
                            }}
                            label=""
                            disabled={readonly}
                            placeholder={getString('valueLabel')}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
    </FormikForm>
  )
}
