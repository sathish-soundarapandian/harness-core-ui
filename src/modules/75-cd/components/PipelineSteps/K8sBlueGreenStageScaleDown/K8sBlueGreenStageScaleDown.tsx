/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikErrors } from 'formik'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { K8sBGStageScaleDownStepInfo, StepElementConfig } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { StringsMap } from 'stringTypes'
import { validateGitOpsExecutionStepForm } from '../PipelineStepsUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface K8sBGStageScaleDownData extends StepElementConfig {
  spec: K8sBGStageScaleDownStepInfo
}

export interface K8sBGStageScaleDownStepProps {
  initialValues: K8sBGStageScaleDownData
  stepViewType?: StepViewType
  readonly?: boolean
  isNewStep?: boolean
  allowableTypes: AllowedTypes
  onUpdate?(data: K8sBGStageScaleDownData): void
  onChange?: (data: K8sBGStageScaleDownData) => void
  template?: K8sBGStageScaleDownData
  path?: string
}
export interface K8sBGStageScaleDownVariableStepProps {
  initialValues: K8sBGStageScaleDownData
  stageIdentifier: string
  onUpdate?(data: K8sBGStageScaleDownData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sBGStageScaleDownData
}

function K8sBGStageScaleDownWidget(
  props: K8sBGStageScaleDownStepProps,
  formikRef: StepFormikFowardRef<K8sBGStageScaleDownData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, onChange, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sBGStageScaleDownData>
        onSubmit={(values: K8sBGStageScaleDownData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        validate={(values: K8sBGStageScaleDownData) => {
          /* istanbul ignore next */
          onChange?.(values)
        }}
        formName="k8BGScaleDown"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {formik => {
          setFormikRef(formikRef, formik)
          return (
            <>
              {stepViewType === StepViewType.Template ? null : (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  disabled={readonly}
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{
                    enableConfigureOptions: true,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8sBGStageScaleDownDataInputStep: React.FC<K8sBGStageScaleDownStepProps> = ({
  template,
  path,
  readonly,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          name={`${prefix}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
    </>
  )
}

const K8sBGStageScaleDownWidgetWithRef = React.forwardRef(K8sBGStageScaleDownWidget)

export class K8sBlueGreenStageScaleDown extends PipelineStep<K8sBGStageScaleDownData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<K8sBGStageScaleDownData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <K8sBGStageScaleDownDataInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={!!get(inputSetData, 'readonly', false)}
          template={get(inputSetData, 'template', undefined)}
          path={get(inputSetData, 'path', '')}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as K8sBGStageScaleDownVariableStepProps

      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />
      )
    }
    return (
      <K8sBGStageScaleDownWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={defaultTo(isNewStep, true)}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8sBGStageScaleDownData>): FormikErrors<K8sBGStageScaleDownData> {
    return validateGitOpsExecutionStepForm({ data, template, getString, viewType })
  }

  protected type = StepType.K8sBlueGreenStageScaleDown
  protected stepName = 'K8s BlueGreenStageScaleDown'
  protected stepIcon: IconName = 'bg-scale-down-step'
  protected referenceId = 'K8sBlueGreenStageScaleDown'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.BlueGreenStageScaleDown'

  protected defaultValues: K8sBGStageScaleDownData = {
    identifier: '',
    name: '',
    type: StepType.K8sBlueGreenStageScaleDown,
    timeout: '10m',
    spec: {}
  }
}
