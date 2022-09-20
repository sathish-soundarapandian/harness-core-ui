/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { AllowedTypes, Formik, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { StepElementConfig } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSRollingDeployStepInitialValues } from '@pipeline/utils/types'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import css from './ECSRollingDeployStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSRollingDeployStepProps {
  initialValues: ECSRollingDeployStepInitialValues
  onUpdate?: (data: StepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: StepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSRollingDeployStepEdit = (
  props: ECSRollingDeployStepProps,
  formikRef: StepFormikFowardRef<ECSRollingDeployStepInitialValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<ECSRollingDeployStepInitialValues>
        onSubmit={(values: ECSRollingDeployStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName="ecsRollingDeployStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ECSRollingDeployStepInitialValues>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <>
              <NameTimeoutField
                values={{ name: values.name, timeout: values.timeout }}
                setFieldValue={setFieldValue}
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                className={cx(stepCss.formGroup, stepCss.lg)}
                margin={{ top: 'small', bottom: 'medium' }}
              >
                <FormMultiTypeCheckboxField
                  name="spec.sameAsAlreadyRunningInstances"
                  label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                  className={css.checkbox}
                />
                {getMultiTypeFromValue(formik.values?.spec?.sameAsAlreadyRunningInstances) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={defaultTo(formik.values?.spec?.sameAsAlreadyRunningInstances, '') as string}
                    type="String"
                    variableName="spec.sameAsAlreadyRunningInstances"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.sameAsAlreadyRunningInstances', value)}
                    style={{ alignSelf: 'center', marginTop: 11 }}
                    className={css.addmarginTop}
                    isReadonly={readonly}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                className={cx(stepCss.formGroup, stepCss.lg)}
                margin={{ top: 'small', bottom: 'medium' }}
              >
                <FormMultiTypeCheckboxField
                  name="spec.forceNewDeployment"
                  label={getString('cd.ecsRollingDeployStep.forceNewDeployment')}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                  className={css.checkbox}
                />
                {getMultiTypeFromValue(formik.values?.spec?.forceNewDeployment) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={defaultTo(formik.values?.spec?.forceNewDeployment, '') as string}
                    type="String"
                    variableName="spec.forceNewDeployment"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.forceNewDeployment', value)}
                    style={{ alignSelf: 'center', marginTop: 11 }}
                    className={css.addmarginTop}
                    isReadonly={readonly}
                  />
                )}
              </Layout.Horizontal>
            </>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSRollingDeployStepEditRef = React.forwardRef(ECSRollingDeployStepEdit)
