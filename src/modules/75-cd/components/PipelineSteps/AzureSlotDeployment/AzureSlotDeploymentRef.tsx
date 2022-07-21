/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const AzureSlotDeploymentRef = (
  props: AzureSlotDeploymentProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  /* istanbul ignore next */
  const { allowableTypes, isNewStep = true, readonly, initialValues, onUpdate, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const query = useQueryParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionId = (query as any).sectionId || ''

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName={`AzureSlotDeployment-${sectionId}`}
      validate={values => {
        const payload = {
          ...values
        }
        /* istanbul ignore next */
        onChange?.(payload)
      }}
      onSubmit={values => {
        const payload = {
          ...values
        }
        /* istanbul ignore next */
        onUpdate?.(payload)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          webApp: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Web App'
            })
          ),
          deploymentSlot: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Deployment Slot'
            })
          )
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        return (
          <>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{
                    disabled: readonly
                  }}
                />
              </div>
            )}
            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(get(formik, 'values.timeout')) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={get(formik, 'values.timeout') as string}
                  type="String"
                  variableName="timeout"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={
                    /* istanbul ignore next */ value => {
                      formik?.setFieldValue('timeout', value)
                    }
                  }
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={stepCss.divider} />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                name="spec.webApp"
                placeholder={'Specify web app name'}
                label={'Web App Name'}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(get(formik, 'values.spec.webApp')) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={get(formik, 'values.spec.webApp') as string}
                  type="String"
                  variableName="spec.webApp"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={
                    /* istanbul ignore next */ value => {
                      formik?.setFieldValue('spec.webApp', value)
                    }
                  }
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                name="spec.deploymentSlot"
                placeholder={'Specify deployment slot'}
                label={'Deployment Slot'}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(get(formik, 'values.spec.deploymentSlot')) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={get(formik, 'values.spec.deploymentSlot') as string}
                  type="String"
                  variableName="spec.deploymentSlot"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={
                    /* istanbul ignore next */ value => {
                      formik?.setFieldValue('spec.deploymentSlot', value)
                    }
                  }
                  isReadonly={readonly}
                />
              )}
            </div>
          </>
        )
      }}
    </Formik>
  )
}
