/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { Accordion, AllowedTypes, Formik, FormInput, IconName } from '@harness/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'

import { defaultTo, get } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'

import { useStrings } from 'framework/strings'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MergePRVariableStepProps, MergePRVariableView } from './MergePrVariableView'
import MergePRInputStep from './MergePrInputStep'
import OptionalConfiguration from './OptionalConfiguration'
import { validateStepForm } from '../DeployInfrastructureStep/utils'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface MergePrProps {
  initialValues: MergePRStepData
  onUpdate?: (data: MergePRStepData) => void
  onChange?: (data: MergePRStepData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  readonly?: boolean
  inputSetData?: {
    template?: MergePRStepData
    path?: string
    readonly?: boolean
  }
}

export interface Variable {
  value?: number | string
  id?: string
  name?: string
  type: 'String' | 'Number'
}

export interface MergePRStepData extends StepElementConfig {
  spec: {
    deleteSourceBranch: boolean
    variables?: Array<Variable>
  }
}

function MergePRWidget(props: MergePrProps, formikRef: StepFormikFowardRef<MergePRStepData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { GITOPS_API_PARAMS_MERGE_PR } = useFeatureFlags()

  return (
    <>
      <Formik<MergePRStepData>
        onSubmit={
          /* istanbul ignore next */
          (values: MergePRStepData) => {
            /* istanbul ignore next */
            onUpdate?.(values)
          }
        }
        validate={
          /* istanbul ignore next */
          (values: MergePRStepData) => {
            /* istanbul ignore next */
            onChange?.(values)
          }
        }
        formName="mergepr"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<MergePRStepData>) => {
          // this is required
          setFormikRef(formikRef, formik)

          return (
            <>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('pipelineSteps.stepNameLabel')}
                    isIdentifierEditable={isNewStep && !readonly}
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
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{
                    enableConfigureOptions: true,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                  className={stepCss.duration}
                  disabled={readonly}
                />
              </div>

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormInput.CheckBox name="spec.deleteSourceBranch" label={getString('cd.deleteSourceBranch')} />
              </div>

              {GITOPS_API_PARAMS_MERGE_PR ? (
                <>
                  <div className={stepCss.divider} />
                  <Accordion className={stepCss.accordion}>
                    <Accordion.Panel
                      id="optional-config"
                      summary={getString('common.optionalConfig')}
                      details={
                        <OptionalConfiguration formik={formik} readonly={readonly} allowableTypes={allowableTypes} />
                      }
                    />
                  </Accordion>
                </>
              ) : null}
            </>
          )
        }}
      </Formik>
    </>
  )
}

const MergePRWidgetWithRef = React.forwardRef(MergePRWidget)
export class MergePR extends PipelineStep<MergePRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<MergePRStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      inputSetData,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <MergePRInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          allowableTypes={allowableTypes}
          readonly={!!get(inputSetData, 'readonly', false)}
          template={get(inputSetData, 'template', undefined)}
          path={get(inputSetData, 'path', '')}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return <MergePRVariableView {...(customStepProps as MergePRVariableStepProps)} originalData={initialValues} />
    }
    return (
      <MergePRWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        isNewStep={defaultTo(isNewStep, true)}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        ref={formikRef}
        readonly={readonly}
        allowableTypes={allowableTypes}
        onChange={data => onChange?.(this.processFormData(data))}
      />
    )
  }

  protected type = StepType.MergePR
  protected stepName = 'Merge PR'
  protected stepIconColor = Color.GREY_700
  protected stepIcon: IconName = 'merge-pr'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.mergePR'

  // istanbul ignore next
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<MergePRStepData>): FormikErrors<MergePRStepData> {
    return validateStepForm({ data, template, getString, viewType })
  }

  protected defaultValues: MergePRStepData = {
    name: '',
    identifier: '',
    type: StepType.MergePR,
    timeout: '10m',
    spec: {
      deleteSourceBranch: false
    }
  }

  private getInitialValues(initialValues: MergePRStepData): MergePRStepData {
    const variables = get(initialValues, 'spec.variables', [])
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,

        variables: Array.isArray(variables)
          ? variables.map(variable => ({
              ...variable,
              id: uuid()
            }))
          : /*istanbul ignore next*/ []
      }
    }
  }

  processFormData(data: MergePRStepData): MergePRStepData {
    const variables = get(data, 'spec.variables', [])
    return {
      ...data,
      spec: {
        ...data.spec,
        variables: Array.isArray(variables)
          ? variables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
          : /*istanbul ignore next*/ undefined
      }
    }
  }
}
