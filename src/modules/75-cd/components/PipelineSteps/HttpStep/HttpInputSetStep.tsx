/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput, AllowedTypes } from '@wings-software/uicore'
import { isEmpty, isArray } from 'lodash-es'
import cx from 'classnames'

import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import type { HttpStepFormData, HttpStepData, HttpStepHeaderConfig, HttpStepOutputVariable } from './types'
import { httpStepType } from './HttpStepBase'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HttpStep.module.scss'

export interface HttpInputSetStepProps {
  initialValues: HttpStepFormData
  onUpdate?: (data: HttpStepFormData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: HttpStepData
  path: string
  allowableTypes: AllowedTypes
}

export default function HttpInputSetStep(props: HttpInputSetStepProps): React.ReactElement {
  const { template, path, readonly, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { expressions } = useVariablesExpression()

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.url) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('UrlLabel')}
            placeholder={getString('pipeline.utilitiesStep.url')}
            name={`${prefix}spec.url`}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType),
              allowedValuesType: ALLOWED_VALUES_TYPE.URL
            }}
            fieldPath={'spec.url'}
            template={template}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.method) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <SelectInputSetView
            label={getString('methodLabel')}
            name={`${prefix}spec.method`}
            useValue={true}
            fieldPath={'spec.method'}
            template={template}
            selectItems={httpStepType}
            multiTypeInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            configureOptionsProps={{ isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType) }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.requestBody) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeTextAreaField
            label={getString('requestBodyLabel')}
            placeholder={getString('pipeline.utilitiesStep.requestBody')}
            name={`${prefix}spec.requestBody`}
            multiTypeTextArea={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.assertion) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('assertionLabel')}
            name={`${prefix}spec.assertion`}
            multiTextInputProps={{
              placeholder: getString('pipeline.utilitiesStep.url'),
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            configureOptionsProps={{ isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType) }}
            fieldPath={'spec.assertion'}
            template={template}
          />
        </div>
      ) : null}
      {isArray(template?.spec?.headers) && template?.spec?.headers ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.headers`}
            label={getString('common.headers')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.headers"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.headerRow}>
                      <span className={css.label}>Key</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {template.spec.headers.map(({ key }: HttpStepHeaderConfig, i: number) => (
                      <div className={css.headerRow} key={key}>
                        <FormInput.Text
                          name={`${prefix}spec.headers[${i}].key`}
                          placeholder={getString('pipeline.keyPlaceholder')}
                          disabled={true}
                        />
                        <FormInput.MultiTextInput
                          name={`${prefix}spec.headers[${i}].value`}
                          placeholder={getString('common.valuePlaceholder')}
                          disabled={readonly}
                          multiTextInputProps={{
                            allowableTypes: allowableTypes,
                            expressions,
                            disabled: readonly
                          }}
                          label=""
                        />
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {isArray(template?.spec?.outputVariables) && template?.spec?.outputVariables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.outputVariables`}
            label={getString('outputLabel')}
            disableTypeSelection
          >
            <FieldArray
              name={`${prefix}spec.outputVariables`}
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.responseMappingRow}>
                      <span className={css.label}>Variable Name</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {((template.spec.outputVariables as HttpStepOutputVariable[]) || []).map(
                      ({ id }: HttpStepOutputVariable, i: number) => (
                        <div className={css.responseMappingRow} key={id}>
                          <FormInput.Text
                            name={`${prefix}spec.outputVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />
                          <FormInput.MultiTextInput
                            name={`${prefix}spec.outputVariables[${i}].value`}
                            placeholder={getString('valueLabel')}
                            disabled={readonly}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: readonly
                            }}
                            label=""
                          />
                        </div>
                      )
                    )}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
    </React.Fragment>
  )
}
