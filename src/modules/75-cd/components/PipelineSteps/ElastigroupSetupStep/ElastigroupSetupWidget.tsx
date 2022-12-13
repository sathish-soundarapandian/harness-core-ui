/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, Formik, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { defaultTo } from 'lodash-es'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import type { ElastigroupSetupData } from './ElastigroupSetupTypes'
import ElastigroupSetupSource from './ElastigroupSetupSource'

interface ElastigroupSetupWidgetProps {
  initialValues: ElastigroupSetupData
  onUpdate?: (data: ElastigroupSetupData) => void
  onChange?: (data: ElastigroupSetupData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function ElastigroupSetupWidget(
  { initialValues, onUpdate, onChange, allowableTypes, isNewStep, readonly, stepViewType }: ElastigroupSetupWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()
  const formikRefValues = (): ElastigroupSetupData =>
    (formikRef as React.MutableRefObject<FormikProps<unknown> | null>)?.current?.values as ElastigroupSetupData

  function commonValidation(this: Yup.TestContext, value: any, valueString: string): boolean | Yup.ValidationError {
    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && typeof value !== 'number') {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBe', {
          value: valueString
        })
      })
    }
    if (value < 0) {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
          value: valueString,
          value2: 0
        })
      })
    }
    return true
  }

  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      name: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('cd.ElastigroupStep.appName') })
      ),
      instances: Yup.object().shape({
        type: Yup.string().trim().required(getString('common.validation.typeIsRequired')),
        spec: Yup.object().when('type', {
          is: 'Fixed',
          then: Yup.object().shape({
            desired: Yup.mixed().test({
              test(value): boolean | Yup.ValidationError {
                const otherValues = formikRefValues().spec.instances.spec
                if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                  if (value < otherValues.min) {
                    return this.createError({
                      message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                        value: getString('cd.ElastigroupStep.desiredInstances'),
                        value2: getString('cd.ElastigroupStep.minInstances')
                      })
                    })
                  } else if (value > otherValues.max) {
                    return this.createError({
                      message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                        value: getString('cd.ElastigroupStep.desiredInstances'),
                        value2: getString('cd.ElastigroupStep.maxInstances')
                      })
                    })
                  }
                }
                return commonValidation.call(this, value, getString('cd.ElastigroupStep.desiredInstances'))
              }
            }),
            min: Yup.mixed().test({
              test(value): boolean | Yup.ValidationError {
                const otherValues = formikRefValues().spec.instances.spec
                if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                  if (value > otherValues.desired) {
                    return this.createError({
                      message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                        value: getString('cd.ElastigroupStep.minInstances'),
                        value2: getString('cd.ElastigroupStep.desiredInstances')
                      })
                    })
                  } else if (value > otherValues.max) {
                    return this.createError({
                      message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                        value: getString('cd.ElastigroupStep.minInstances'),
                        value2: getString('cd.ElastigroupStep.maxInstances')
                      })
                    })
                  }
                }
                return commonValidation.call(this, value, getString('cd.ElastigroupStep.minInstances'))
              }
            }),
            max: Yup.mixed().test({
              test(value): boolean | Yup.ValidationError {
                const otherValues = formikRefValues().spec.instances.spec
                if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                  if (value < otherValues.min) {
                    return this.createError({
                      message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                        value: getString('cd.ElastigroupStep.maxInstances'),
                        value2: getString('cd.ElastigroupStep.minInstances')
                      })
                    })
                  } else if (value < otherValues.desired) {
                    return this.createError({
                      message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                        value: getString('cd.ElastigroupStep.maxInstances'),
                        value2: getString('cd.ElastigroupStep.desiredInstances')
                      })
                    })
                  }
                }
                return commonValidation.call(this, value, getString('cd.ElastigroupStep.maxInstances'))
              }
            })
          })
        })
      })
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<ElastigroupSetupData>
      onSubmit={submit => {
        /* istanbul ignore next */ onUpdate?.(submit)
      }}
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="ElastigroupSetupForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ElastigroupSetupData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            <ElastigroupSetupSource
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
  )
}

export const ElastigroupSetupWidgetWithRef = React.forwardRef(ElastigroupSetupWidget)
