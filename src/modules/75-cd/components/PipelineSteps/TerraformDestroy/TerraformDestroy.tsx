/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'

import { isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors } from 'formik'

import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StringsMap } from 'stringTypes'
import TerraformInputStep from '../Common/Terraform/TerraformInputStep'
import { TerraformVariableStep } from '../Common/Terraform/TerraformVariableView'
import {
  getTerraformInitialValues,
  onSubmitTerraformData,
  TerraformData,
  TerraformVariableStepProps
} from '../Common/Terraform/TerraformInterfaces'

import TerraformEditView from '../Common/Terraform/Editview/TerraformEditView'

const TerraformDestroyWidgetWithRef = React.forwardRef(TerraformEditView)

export class TerraformDestroy extends PipelineStep<TerraformData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformDestroy
  protected referenceId = 'terraformDestroyStep'
  protected defaultValues: TerraformData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerraformDestroy,
    spec: {
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terraform-destroy'
  protected stepName = 'Terraform Destroy'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerraformDestroy'
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TerraformData>): FormikErrors<TerraformData> {
    /* istanbul ignore next */
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    /* istanbul ignore next */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore next */
      if (isRequired) {
        /* istanbul ignore next */
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore next */
        if (e instanceof Yup.ValidationError) {
          /* istanbul ignore next */
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore next */
    if (isEmpty(errors.spec)) {
      /* istanbul ignore next */
      delete errors.spec
    }
    /* istanbul ignore next */
    return errors
  }

  /* istanbul ignore next */
  processFormData(data: any): TerraformData {
    return onSubmitTerraformData(data)
  }

  renderStep(props: StepProps<TerraformData, TerraformVariableStepProps>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <TerraformInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          allValues={inputSetData?.allValues}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={inputSetData?.path}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          fieldPath={
            customStepProps?.variablesData?.spec?.cloudCliConfiguration ? 'cloudCliConfiguration' : 'configuration'
          }
        />
      )
    }
    return (
      <TerraformDestroyWidgetWithRef
        initialValues={getTerraformInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformDestroy}
      />
    )
  }
}
