/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, AllowedTypes, Formik } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { defaultTo } from 'lodash-es'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import OptionalConfigShellScriptProvision from './OptionalConfigShellScriptProvision'
import { ShellScriptProvisionFormData, variableSchema } from './types'
import ShellScriptProvisionSource, { LocationType } from './ShellScriptProvisionSource'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ShellScriptProvisionWidgetProps {
  initialValues: ShellScriptProvisionFormData
  onUpdate?: (data: ShellScriptProvisionFormData) => void
  onChange?: (data: ShellScriptProvisionFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function ShellScriptProvisionWidget(
  {
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    isNewStep,
    readonly,
    stepViewType
  }: ShellScriptProvisionWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      source: Yup.object().shape({
        type: Yup.string().trim().required(getString('common.validation.typeIsRequired')),
        spec: Yup.object().when('type', {
          is: LocationType.INLINE,
          then: Yup.object().shape({
            script: Yup.string()
              .trim()
              .required(getString('common.validation.fieldIsRequired', { name: getString('common.script') }))
          }),
          otherwise: Yup.object().shape({
            file: Yup.string()
              .trim()
              .required(getString('common.validation.fieldIsRequired', { name: getString('common.git.filePath') }))
          })
        })
      }),
      environmentVariables: variableSchema(getString)
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<ShellScriptProvisionFormData>
      onSubmit={submit => {
        /* istanbul ignore next */ onUpdate?.(submit)
      }}
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="shellScriptProvisionForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptProvisionFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            <ShellScriptProvisionSource
              isNewStep={defaultTo(isNewStep, true)}
              stepViewType={stepViewType}
              formik={formik}
              readonly={readonly}
              allowableTypes={allowableTypes}
            />
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <OptionalConfigShellScriptProvision
                    formik={formik}
                    readonly={readonly}
                    allowableTypes={allowableTypes}
                  />
                }
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const ShellScriptProvisionWidgetWithRef = React.forwardRef(ShellScriptProvisionWidget)
