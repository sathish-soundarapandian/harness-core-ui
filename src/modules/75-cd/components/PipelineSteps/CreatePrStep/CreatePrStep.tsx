/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, IconName, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import type { FormikErrors, FormikProps } from 'formik'

import { defaultTo, get } from 'lodash-es'

import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'

import { useStrings } from 'framework/strings'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'
import CreatePRScript from './CreatePrScript'

import CreatePRInputStep from './CreatePRInputStep'
import { CreatePRVariableStepProps, CreatePRVariableView } from './CreatePRVariableStep'
import { validateStepForm } from '../DeployInfrastructureStep/utils'

export interface CreatePRStepData extends StepElementConfig {
  spec?: {
    overrideConfig: boolean
    shell?: string
    source?: {
      type: string
      spec: {
        updateConfigScript?: string
      }
    }
  }
}

interface CreatePrProps {
  initialValues: CreatePRStepData
  onUpdate?: (data: CreatePRStepData) => void
  onChange?: (data: CreatePRStepData) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  isNewStep?: boolean
  readonly?: boolean
  inputSetData?: {
    template?: CreatePRStepData
    path?: string
    readonly?: boolean
  }
}

function CreatePRWidget(props: CreatePrProps, formikRef: StepFormikFowardRef<CreatePRStepData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  return (
    <>
      <Formik<CreatePRStepData>
        onSubmit={
          /* istanbul ignore next */
          (values: CreatePRStepData) => {
            /* istanbul ignore next */
            onUpdate?.(values)
          }
        }
        validate={
          /* istanbul ignore next */
          (values: CreatePRStepData) => {
            /* istanbul ignore next */
            onChange?.(values)
          }
        }
        formName="createpr"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<CreatePRStepData>) => {
          // this is required
          setFormikRef(formikRef, formik)

          return (
            <React.Fragment>
              <CreatePRScript
                isNewStep={defaultTo(isNewStep, true)}
                stepViewType={stepViewType}
                formik={formik}
                readonly={readonly}
                allowableTypes={allowableTypes}
              />
            </React.Fragment>
          )
        }}
      </Formik>
    </>
  )
}

const CreatePRWidgetWithRef = React.forwardRef(CreatePRWidget)
export class CreatePr extends PipelineStep<CreatePRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<CreatePRStepData>): JSX.Element {
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

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <CreatePRInputStep
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
      return <CreatePRVariableView {...(customStepProps as CreatePRVariableStepProps)} originalData={initialValues} />
    }
    return (
      <CreatePRWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={defaultTo(isNewStep, true)}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        ref={formikRef}
        readonly={readonly}
        allowableTypes={allowableTypes}
        onChange={onChange}
      />
    )
  }

  protected type = StepType.CreatePR
  protected stepName = 'Create PR'
  protected stepIconColor = Color.GREY_700
  protected stepIcon: IconName = 'create-pr'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.createPR'

  // istanbul ignore next
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CreatePRStepData>): FormikErrors<CreatePRStepData> {
    return validateStepForm({ data, template, getString, viewType })
  }

  protected defaultValues: CreatePRStepData = {
    name: '',
    identifier: '',
    type: StepType.CreatePR,
    timeout: '10m',
    spec: {
      overrideConfig: false,
      shell: 'Bash'
    }
  }
}
