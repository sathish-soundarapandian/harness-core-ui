/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@harness/uicore'

import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, AllowedTypes, FormInput } from '@harness/uicore'
import { get, defaultTo, isArray } from 'lodash-es'
import cx from 'classnames'
import { FieldArray } from 'formik'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
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
  const { template, path, readonly, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = defaultTo(path, '')
  return (
    <FormikForm>
      {getMultiTypeFromValue(get(template, 'timeout', '')) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}.timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      {getMultiTypeFromValue(get(template, 'spec.prTitle', '')) === MultiTypeInputType.RUNTIME ? (
        <TextFieldInputSetView
          label={getString('pipeline.prTitle')}
          name={`${prefix}spec.prTitle`}
          multiTextInputProps={{
            placeholder: getString('pipeline.prTitle'),
            expressions,
            disabled: readonly,
            allowableTypes
          }}
          configureOptionsProps={{ isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType) }}
          fieldPath={'spec.prTitle'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      ) : null}

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
