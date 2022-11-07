/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { defaultTo, isEmpty, set } from 'lodash-es'

import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'
import { EmailStepWidgetWithRef } from './EmailStepWidget'
import type { EmailStepData } from './emailStepTypes'
import EmailStepInputSet from './EmailStepInputSet'
import { EmailValidationSchema, EmailValidationSchemaWithoutRequired } from './emailStepUtils'
import { EmailStepVariablesView, EmailStepVariablesViewProps } from './EmailStepVariablesView'

export class EmailStep extends PipelineStep<EmailStepData> {
  constructor() {
    super()
    this._hasDelegateSelectionVisible = true
    this._hasStepVariables = true
  }

  protected type = StepType.Email
  protected stepName = 'Email'
  protected stepIcon: IconName = 'email-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Email'

  protected defaultValues: EmailStepData = {
    identifier: '',
    name: '',
    type: StepType.Email,
    timeout: '1d',
    spec: {
      to: '',
      cc: '',
      subject: '',
      body: ''
    }
  }

  renderStep(this: EmailStep, props: StepProps<EmailStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      stepViewType,
      inputSetData,
      formikRef,
      isNewStep,
      readonly,
      allowableTypes,
      customStepProps
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <EmailStepInputSet
          initialValues={initialValues}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={defaultTo(inputSetData?.path, '')}
          allowableTypes={allowableTypes}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <EmailStepVariablesView {...(customStepProps as EmailStepVariablesViewProps)} originalData={initialValues} />
      )
    }

    return (
      <EmailStepWidgetWithRef
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(data)}
        onChange={data => onChange?.(data)}
        stepViewType={stepViewType}
        isNewStep={isNewStep}
        readonly={!!inputSetData?.readonly}
        allowableTypes={allowableTypes}
        isDisabled={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<EmailStepData>): FormikErrors<EmailStepData> {
    const errors: FormikErrors<EmailStepData> = { spec: {} }
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '1d' })
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

    if (getMultiTypeFromValue(template?.spec?.to) === MultiTypeInputType.RUNTIME && isRequired) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            to: EmailValidationSchema(getString!)
          })
        })
        schema.validateSync(data)
      } catch (error: any) {
        set(errors, 'spec.to', error.message)
      }
    }

    if (getMultiTypeFromValue(template?.spec?.cc) === MultiTypeInputType.RUNTIME && isRequired) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            cc: EmailValidationSchemaWithoutRequired(getString!)
          })
        })
        schema.validateSync(data)
      } catch (error: any) {
        set(errors, 'spec.cc', error.message)
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.subject) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.subject)
    ) {
      set(errors, 'spec.subject', getString?.('fieldRequired', { field: 'Subject' }))
    }

    if (
      getMultiTypeFromValue(template?.spec?.body) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.body)
    ) {
      set(errors, 'spec.body', getString?.('fieldRequired', { field: 'Body' }))
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
