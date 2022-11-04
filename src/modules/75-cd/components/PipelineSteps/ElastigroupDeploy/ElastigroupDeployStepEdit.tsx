/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, Formik, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { FormInstanceDropdown } from '@common/components'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ElastigroupDeployStepInfo } from 'services/cd-ng'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ElastigroupDeployStepEditProps } from './ElastigroupDeployInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const ElastigroupDeployStepEdit = (
  props: ElastigroupDeployStepEditProps,
  formikRef: StepFormikFowardRef<ElastigroupDeployStepInfo>
): React.ReactElement => {
  const {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    onChange,
    allowableTypes,
    stepViewType,
    formikFormName
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<ElastigroupDeployStepInfo>
        onSubmit={(values: ElastigroupDeployStepInfo) => {
          onUpdate?.(values)
        }}
        formName={formikFormName}
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            newService: getInstanceDropdownSchema({ required: true }, getString),
            oldService: getInstanceDropdownSchema({ required: false }, getString)
          })
        })}
      >
        {(formik: FormikProps<ElastigroupDeployStepInfo>) => {
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
              <div className={stepCss.divider} />

              <div className={stepCss.stepSubSectionHeading}>New Service</div>
              <div className={classNames(stepCss.formGroup, stepCss.md)}>
                <FormInstanceDropdown
                  name={'spec.newService'}
                  label={getString('common.instanceLabel')}
                  readonly={readonly}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                />
                {(getMultiTypeFromValue(values?.spec?.newService?.spec?.count) === MultiTypeInputType.RUNTIME ||
                  getMultiTypeFromValue(values?.spec?.newService?.spec?.percentage) === MultiTypeInputType.RUNTIME) && (
                  <ConfigureOptions
                    value={
                      (values?.spec?.newService?.spec?.count as string) ||
                      (values?.spec?.newService?.spec?.percentage as string)
                    }
                    type="String"
                    variableName={getString('instanceFieldOptions.instances')}
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('instances', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={stepCss.noLookDivider} />

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <>
                      <div className={stepCss.stepSubSectionHeading}>Old Service</div>
                      <div className={classNames(stepCss.formGroup, stepCss.md)}>
                        <FormInstanceDropdown
                          name={'spec.oldService'}
                          label={getString('common.instanceLabel')}
                          readonly={readonly}
                          expressions={expressions}
                          allowableTypes={allowableTypes}
                        />
                        {(getMultiTypeFromValue(values?.spec?.oldService?.spec?.count) === MultiTypeInputType.RUNTIME ||
                          getMultiTypeFromValue(values?.spec?.oldService?.spec?.percentage) ===
                            MultiTypeInputType.RUNTIME) && (
                          <ConfigureOptions
                            value={
                              (values?.spec?.oldService?.spec?.count as string) ||
                              (values?.spec?.oldService?.spec?.percentage as string)
                            }
                            type="String"
                            variableName={getString('instanceFieldOptions.instances')}
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => {
                              setFieldValue('instances', value)
                            }}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                    </>
                  }
                />
              </Accordion>
            </>
          )
        }}
      </Formik>
    </>
  )
}

export const ElastigroupDeployStepEditRef = React.forwardRef(ElastigroupDeployStepEdit)
