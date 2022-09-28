/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, AllowedTypes, Formik, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { setFormikRef, StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import OptionalConfiguration from './OptionalConfiguration'
import type { HttpStepData, HttpStepFormData } from './types'
import HttpStepBase from './HttpStepBase'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1160446867/Http+Step
 */

export interface HttpStepWidgetProps {
  initialValues: HttpStepFormData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: HttpStepFormData) => void
  onChange?: (data: HttpStepFormData) => void
  stepViewType?: StepViewType
  readonly: boolean
  allowableTypes?: AllowedTypes
}

export function HttpStepWidget(
  props: HttpStepWidgetProps,
  formikRef: StepFormikFowardRef<HttpStepData>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, isNewStep, isDisabled, stepViewType, allowableTypes } = props
  const { getString } = useStrings()

  return (
    <Formik<HttpStepFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      validate={values => {
        onChange?.(values)
      }}
      initialValues={initialValues}
      formName="httpWidget"
      validationSchema={Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          url: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
              return Yup.string()
                .required(getString('common.validation.urlIsRequired'))
                .url(getString('validation.urlIsNotValid'))
            }
            return Yup.string().required(getString('common.validation.urlIsRequired'))
          }),
          method: Yup.mixed().required(getString('pipelineSteps.methodIsRequired')),
          headers: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required(getString('common.validation.keyIsRequired')),
              value: Yup.string().required(getString('common.validation.valueIsRequired'))
            })
          ),
          outputVariables: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required(getString('common.validation.nameIsRequired')),
              value: Yup.string().required(getString('common.validation.valueIsRequired'))
            })
          )
        }),
        ...getNameAndIdentifierSchema(getString, stepViewType)
      })}
    >
      {(formik: FormikProps<HttpStepFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            <HttpStepBase
              formik={formik}
              isNewStep={isNewStep}
              stepViewType={stepViewType}
              readonly={isDisabled}
              allowableTypes={allowableTypes}
            />
            <Accordion activeId="step-1" className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <OptionalConfiguration formik={formik} readonly={isDisabled} allowableTypes={allowableTypes} />
                }
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const HttpStepWidgetWithRef = React.forwardRef(HttpStepWidget)
