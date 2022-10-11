/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, Formik, IconName } from '@wings-software/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import type { FormikErrors, FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'

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
import UpdateReleaseRepoForm from './UpdateReleaseRepoForm'

import { UpdateReleaseRepoVariableStepProps, UpdateReleaseRepoVariableView } from './UpdateReleaseRepoVariableStep'
import UpdateReleaseRepoInputStep from './UpdateReleaseRepoInputStep'
import { validateStepForm } from '../PipelineSteps/DeployInfrastructureStep/utils'

export interface ReleaseRepoVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}

export interface UpdateReleaseRepoStepData extends StepElementConfig {
  spec: {
    variables?: Array<Omit<ReleaseRepoVariable, 'id'>>
  }
}

export interface UpdateReleaseRepoFormData extends StepElementConfig {
  spec: {
    variables?: Array<ReleaseRepoVariable>
  }
}

interface UpdateReleaseRepoProps {
  initialValues: UpdateReleaseRepoFormData
  onUpdate?: (data: UpdateReleaseRepoFormData) => void
  onChange?: (data: UpdateReleaseRepoFormData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  readonly?: boolean
  inputSetData?: {
    template?: UpdateReleaseRepoFormData
    path?: string
    readonly?: boolean
  }
}

function UpdateReleaseRepoWidget(props: UpdateReleaseRepoProps, formikRef: StepFormikFowardRef): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<UpdateReleaseRepoFormData>
        /* istanbul ignore next */
        onSubmit={submit => {
          /* istanbul ignore next */
          onUpdate?.(submit)
        }}
        validate={formValues => {
          /* istanbul ignore next */
          onChange?.(formValues)
        }}
        formName="updateReleaseRepo"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<UpdateReleaseRepoFormData>) => {
          // this is required
          setFormikRef(formikRef, formik)

          return (
            <React.Fragment>
              <UpdateReleaseRepoForm
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

const UpdateReleaseRepoWidgetWithRef = React.forwardRef(UpdateReleaseRepoWidget)

export class UpdateReleaseRepo extends PipelineStep<UpdateReleaseRepoStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<UpdateReleaseRepoStepData>): JSX.Element {
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
    /* istanbul ignore next */
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <UpdateReleaseRepoInputStep
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          allowableTypes={allowableTypes}
          readonly={!!get(inputSetData, 'readonly', false)}
          template={get(inputSetData, 'template', undefined)}
          path={get(inputSetData, 'path', '')}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <UpdateReleaseRepoVariableView
          {...(customStepProps as UpdateReleaseRepoVariableStepProps)}
          originalData={initialValues}
        />
      )
    }
    return (
      <UpdateReleaseRepoWidgetWithRef
        /* istanbul ignore next */
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => {
          /* istanbul ignore next */
          onUpdate?.(this.processFormData(data))
        }}
        isNewStep={defaultTo(isNewStep, true)}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        ref={formikRef}
        readonly={readonly}
        allowableTypes={allowableTypes}
        onChange={data => {
          /* istanbul ignore next */
          onChange?.(this.processFormData(data))
        }}
      />
    )
  }

  protected type = StepType.GitOpsUpdateReleaseRepo
  protected stepName = 'Update ReleaseRepo'
  protected stepIconColor = Color.GREY_700
  protected stepIcon: IconName = 'create-pr'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.updateReleaseRepo'

  // istanbul ignore next
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<UpdateReleaseRepoStepData>): FormikErrors<UpdateReleaseRepoStepData> {
    return validateStepForm({ data, template, getString, viewType })
  }

  protected defaultValues: UpdateReleaseRepoStepData = {
    name: '',
    identifier: '',
    type: StepType.GitOpsUpdateReleaseRepo,
    timeout: '10m',
    spec: {
      variables: []
    }
  }

  private getInitialValues(initialValues: UpdateReleaseRepoStepData): UpdateReleaseRepoFormData {
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

  processFormData(data: UpdateReleaseRepoFormData): any {
    const variables = get(data, 'spec.variables', [])
    const modifiedData = {
      ...data,
      spec: {
        ...data.spec,
        variables: Array.isArray(variables)
          ? variables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
          : /*istanbul ignore next*/ undefined
      }
    }

    return modifiedData
  }
}
