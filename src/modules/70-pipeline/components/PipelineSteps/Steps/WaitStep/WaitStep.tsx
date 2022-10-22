/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'

import { IconName, Color, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { WaitStepData } from './WaitStepTypes'
import WaitInputSetStep from './WaitInputSetStep'
import { WaitStepVariablesView, WaitStepVariablesViewProps } from './WaitStepVariablesView'
import { WaitStepWidgetWithRef } from './WaitStepWidget'

export class WaitStep extends PipelineStep<WaitStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Wait
  protected stepName = 'Wait Step'
  protected stepIcon: IconName = 'evaluate-policy' // to be refactored
  protected stepIconColor = Color.GREY_700
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Wait'

  protected defaultValues: WaitStepData = {
    name: '',
    identifier: '',
    type: StepType.Wait,
    spec: { duration: '10m' }
  }

  renderStep(props: StepProps<WaitStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      stepViewType,
      formikRef,
      isNewStep,
      readonly,
      inputSetData,
      allowableTypes,
      customStepProps
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <WaitInputSetStep
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <WaitStepVariablesView {...(customStepProps as WaitStepVariablesViewProps)} initialValues={initialValues} />
      )
    }

    return (
      <WaitStepWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        isNewStep={isNewStep}
        readonly={readonly}
        ref={formikRef}
        allowableTypes={allowableTypes}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<WaitStepData>): FormikErrors<WaitStepData> {
    const errors: FormikErrors<WaitStepData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm
    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.spec.duration) === MultiTypeInputType.RUNTIME) {
      let durationSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
      if (isRequired) {
        durationSchema = durationSchema.required(getString?.('pipeline.waitStep.validation.duration10SecMinimum'))
      }
      const duration = Yup.object().shape({
        spec: Yup.object().shape({ duration: durationSchema })
      })

      try {
        duration.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }

    return errors
  }

  private getInitialValues(initialValues: WaitStepData): WaitStepData {
    return {
      ...initialValues
    }
  }

  processFormData(data: WaitStepData): WaitStepData {
    return {
      ...data
    }
  }
}
