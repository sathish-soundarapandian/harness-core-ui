/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { isEmpty, set } from 'lodash-es'

import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { StringsMap } from 'stringTypes'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { PolicyStepData, PolicyStepFormData } from './PolicyStepTypes'
import PolicyInputSetStep from './PolicyInputSetStep'
import { PolicyStepVariablesView, PolicyStepVariablesViewProps } from './PolicyStepVariablesView'
import { PolicyStepWidgetWithRef } from './PolicyStepWidget'

export class PolicyStep extends PipelineStep<PolicyStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Policy
  protected stepName = 'Policy Step'
  protected stepIcon: IconName = 'evaluate-policy'
  protected stepIconColor = Color.GREY_700
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Policy'

  protected defaultValues: PolicyStepData = {
    name: '',
    identifier: '',
    type: StepType.Policy,
    timeout: '10m',
    spec: {
      policySets: [],
      type: 'Custom',
      policySpec: {
        payload: ''
      }
    }
  }

  renderStep(props: StepProps<PolicyStepData>): JSX.Element {
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
        <PolicyInputSetStep
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <PolicyStepVariablesView {...(customStepProps as PolicyStepVariablesViewProps)} originalData={initialValues} />
      )
    }

    return (
      <PolicyStepWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        isNewStep={isNewStep}
        readonly={readonly}
        ref={formikRef}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<PolicyStepData>): FormikErrors<PolicyStepData> {
    const errors: FormikErrors<PolicyStepData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm
    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(/* istanbul ignore next */ template?.spec?.policySpec?.payload) ===
        MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(/* istanbul ignore next */ data?.spec?.policySpec?.payload?.trim())
    ) {
      set(errors, 'spec.policySpec.payload', getString?.('fieldRequired', { field: 'Payload' }))
    }

    return errors
  }

  private getInitialValues(initialValues: PolicyStepData): PolicyStepFormData {
    return {
      ...initialValues
    }
  }

  processFormData(data: PolicyStepFormData): PolicyStepData {
    return {
      ...data
    }
  }
}
