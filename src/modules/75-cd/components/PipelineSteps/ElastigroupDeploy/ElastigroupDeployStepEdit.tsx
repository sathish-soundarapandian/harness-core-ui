/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, Formik, Text, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { set } from 'lodash-es'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { FormInstanceDropdown } from '@common/components'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ElastigroupDeployStepEditProps, ElastigroupDeployStepInfoData } from './ElastigroupDeployInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ElastigroupDeploy.module.scss'

const ElastigroupDeployStepEdit = (
  props: ElastigroupDeployStepEditProps,
  formikRef: StepFormikFowardRef<ElastigroupDeployStepInfoData>
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
      <Formik<ElastigroupDeployStepInfoData>
        onSubmit={(values: ElastigroupDeployStepInfoData) => {
          onUpdate?.(values)
        }}
        formName={formikFormName}
        initialValues={initialValues}
        validate={data => {
          const getOldServiceSpec = data?.spec?.oldService?.spec
          /* istanbul ignore else */
          if (!getOldServiceSpec?.count && !getOldServiceSpec?.percentage) {
            set(data, 'spec.oldService', undefined)
          }
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
        {(formik: FormikProps<ElastigroupDeployStepInfoData>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />
              <div className={stepCss.divider} />

              <Text className={css.subHeadingStyle} tooltipProps={{ dataTooltipId: 'ElastigroupDeploy_newService' }}>
                {getString('newService')}
              </Text>
              <div className={classNames(stepCss.formGroup, stepCss.md)}>
                <FormInstanceDropdown
                  name={'spec.newService'}
                  label={getString('common.instanceLabel')}
                  readonly={readonly}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  defaultValue={{ type: InstanceTypes.Instances, spec: { count: '' } }}
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
                    onChange={
                      /* istanbul ignore next */ value => {
                        setFieldValue('instances', value)
                      }
                    }
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
                      <Text
                        className={css.subHeadingStyle}
                        tooltipProps={{ dataTooltipId: 'ElastigroupDeploy_oldService' }}
                      >
                        {getString('cd.oldService')}
                      </Text>
                      <div className={classNames(stepCss.formGroup, stepCss.md)}>
                        <FormInstanceDropdown
                          name={'spec.oldService'}
                          label={getString('common.instanceLabel')}
                          readonly={readonly}
                          expressions={expressions}
                          allowableTypes={allowableTypes}
                          textProps={{ min: 0 }}
                          defaultValue={{ type: InstanceTypes.Instances, spec: { count: '' } }}
                          onChange={
                            /* istanbul ignore next */ val => {
                              formik.setFieldValue('spec.oldService', { ...val })
                            }
                          }
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
                            onChange={
                              /* istanbul ignore next */ value => {
                                setFieldValue('instances', value)
                              }
                            }
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
