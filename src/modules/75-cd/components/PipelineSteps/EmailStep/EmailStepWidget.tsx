/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, Formik } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'
import { setFormikRef, StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { EmailStepData } from './emailStepTypes'
import BaseEmailStep from './BaseEmailStep'
import { EmailValidationSchema, EmailValidationSchemaWithoutRequired } from './emailStepUtils'

/**
 * Spec ->
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/21096826293/Email+Step
 */

interface EmailStepWidgetProps {
  initialValues: EmailStepData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: EmailStepData) => void
  onChange?: (data: EmailStepData) => void
  stepViewType?: StepViewType
  readonly: boolean
  allowableTypes?: AllowedTypes
}

export function EmailStepWidget(
  props: EmailStepWidgetProps,
  formikRef: StepFormikFowardRef<EmailStepData>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, isNewStep, isDisabled, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      to: EmailValidationSchema(getString),
      cc: EmailValidationSchemaWithoutRequired(getString),
      subject: Yup.string().required(getString('common.smtp.validationSubject')),
      body: Yup.string()
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<EmailStepData>
      initialValues={initialValues}
      formName="emailStepForm"
      onSubmit={
        /* istanbul ignore next */ values => {
          onUpdate?.(values)
        }
      }
      validate={values => {
        /* istanbul ignore next */ onChange?.(values)
      }}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<EmailStepData>) => {
        setFormikRef(formikRef, formik)

        return (
          <BaseEmailStep
            formik={formik}
            isNewStep={defaultTo(isNewStep, true)}
            stepViewType={stepViewType}
            readonly={isDisabled}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const EmailStepWidgetWithRef = React.forwardRef(EmailStepWidget)
