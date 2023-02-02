/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import React from 'react'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType, Formik } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import type { TasBGAppSetupData } from './TasBGAppSetup'
import TasSetupSource from '../TASBasicAppSetupStep/TASSetupSource'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TasBGAppSetupWidgetProps {
  initialValues: TasBGAppSetupData
  onUpdate?: (data: TasBGAppSetupData) => void
  onChange?: (data: TasBGAppSetupData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function TasBGAppSetupWidget(
  { initialValues, onUpdate, onChange, allowableTypes, isNewStep, readonly, stepViewType }: TasBGAppSetupWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  function commonValidation(this: Yup.TestContext, value: any, valueString: string): boolean | Yup.ValidationError {
    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && typeof value !== 'number') {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBe', {
          value: valueString
        })
      })
    }
    if (value < 1) {
      /* istanbul ignore next */
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
          value: valueString,
          value2: 1
        })
      })
    }
    return true
  }

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      tasInstanceCountType: Yup.string().trim().required(getString('common.validation.typeIsRequired')),
      existingVersionToKeep: Yup.mixed().test({
        test(value): boolean | Yup.ValidationError {
          if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
            if (value < 1) {
              return this.createError({
                message: getString?.('pipeline.approvalStep.validation.minimumCountOne')
              })
            }
          }
          return commonValidation.call(this, value, getString('version'))
        }
      })
    })
  })

  return (
    <Formik<TasBGAppSetupData>
      onSubmit={submit => {
        /* istanbul ignore next */ onUpdate?.(submit)
      }}
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="TasBGAppSetupForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<TasBGAppSetupData>) => {
        setFormikRef(formikRef, formik)
        return (
          <>
            <TasSetupSource
              isNewStep={defaultTo(isNewStep, true)}
              stepViewType={stepViewType}
              formik={formik as any}
              readonly={readonly}
              allowableTypes={allowableTypes}
            />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormMultiTypeKVTagInput
                name="spec.tempRoutes"
                tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
                multiTypeProps={{
                  allowableTypes
                }}
                type={getString('tagLabel')}
                label={getString('cd.steps.tas.tempRoutes')}
                enableConfigureOptions
                isArray={true}
              />
            </div>
          </>
        )
      }}
    </Formik>
  )
}

export const TasBGAppSetupWidgetWithRef = React.forwardRef(TasBGAppSetupWidget)
