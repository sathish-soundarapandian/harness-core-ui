/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import React, { FormEvent } from 'react'
import {
  AllowedTypes,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Formik,
  FormInput,
  Text,
  SelectOption
} from '@harness/uicore'
import { toString } from 'lodash-es'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings, UseStringsReturn } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import type { TasCanaryAppSetupData } from './TasCanaryAppSetup'
import { InstancesType, ResizeStrategyType } from '../TASBasicAppSetupStep/TASBasicAppSetupTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TasCanaryAppSetupWidgetProps {
  initialValues: TasCanaryAppSetupData
  onUpdate?: (data: TasCanaryAppSetupData) => void
  onChange?: (data: TasCanaryAppSetupData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export const getResizeStrategies = (getString: UseStringsReturn['getString']): SelectOption[] => [
  {
    label: getString('cd.steps.tas.upscaleNewFirstLabel'),
    value: ResizeStrategyType.UpScaleNewFirst
  },
  {
    label: getString('cd.steps.tas.downScaleOldFirstLabel'),
    value: ResizeStrategyType.DownScaleOldFirst
  }
]

export function TasCanaryAppSetupWidget(
  {
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    isNewStep,
    readonly,
    stepViewType
  }: TasCanaryAppSetupWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

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
          /* istanbul ignore else */
          if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
            if (value < 1) {
              return this.createError({
                message: getString?.('pipeline.approvalStep.validation.minimumCountOne')
              })
            }
          }
          return commonValidation.call(this, value, getString('version'))
        }
      }),
      resizeStrategy: Yup.string().required(
        getString('fieldRequired', { field: getString('cd.steps.tas.resizeStrategy') })
      )
    })
  })

  return (
    <Formik<TasCanaryAppSetupData>
      onSubmit={submit => {
        /* istanbul ignore next */ onUpdate?.(submit)
      }}
      validate={formValues => {
        /* istanbul ignore next */ onChange?.(formValues)
      }}
      formName="TasCanaryAppSetupForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<TasCanaryAppSetupData>) => {
        setFormikRef(formikRef, formik)
        const { values: formValues, setFieldValue } = formik
        return (
          <React.Fragment>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                  isIdentifierEditable={isNewStep && !readonly}
                  inputGroupProps={{
                    placeholder: getString('pipeline.stepNamePlaceholder'),
                    disabled: readonly
                  }}
                />
              </div>
            )}

            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{
                  enableConfigureOptions: true,
                  expressions,
                  disabled: readonly,
                  allowableTypes
                }}
                className={stepCss.duration}
                disabled={readonly}
              />
            </div>

            <div className={stepCss.divider} />

            <FormInput.RadioGroup
              name="spec.tasInstanceCountType"
              label={<Text>{getString('instanceFieldOptions.instanceText')}</Text>}
              items={[
                {
                  label: getString('cd.steps.tas.readFromManifest'),
                  value: InstancesType.FromManifest
                },
                {
                  label: getString('cd.steps.tas.matchRunningInstances'),
                  value: InstancesType.MatchRunningInstances
                }
              ]}
              radioGroup={{ inline: true }}
              onChange={(e: FormEvent<HTMLInputElement>) => {
                setFieldValue('spec.tasInstanceCountType', e.currentTarget.value as InstancesType)
              }}
            />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name="spec.resizeStrategy"
                selectItems={getResizeStrategies(getString)}
                useValue
                multiTypeInputProps={{
                  expressions,
                  allowableTypes,
                  selectProps: {
                    items: getResizeStrategies(getString)
                  }
                }}
                label={getString('cd.steps.tas.resizeStrategy')}
                placeholder={getString('common.selectName', { name: getString('cd.steps.tas.resizeStrategy') })}
                disabled={readonly}
              />
              {getMultiTypeFromValue(formValues.spec.resizeStrategy) === MultiTypeInputType.RUNTIME && (
                <SelectConfigureOptions
                  options={getResizeStrategies(getString)}
                  value={toString(formValues.spec.resizeStrategy)}
                  type="String"
                  variableName="spec.resizeStrategy"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={/* istanbul ignore next */ value => setFieldValue('spec.resizeStrategy', value)}
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={stepCss.divider} />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                name="spec.existingVersionToKeep"
                label={getString('cd.steps.tas.existingVersionToKeep')}
                disabled={readonly}
                multiTextInputProps={{
                  expressions,
                  disabled: readonly,
                  allowableTypes,
                  textProps: { type: 'number' }
                }}
              />
              {getMultiTypeFromValue(formValues.spec.existingVersionToKeep) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={toString(formValues.spec.existingVersionToKeep)}
                  type="Number"
                  variableName="spec.existingVersionToKeep"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={/* istanbul ignore next */ value => setFieldValue('spec.existingVersionToKeep', value)}
                  isReadonly={readonly}
                  allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
                />
              )}
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormMultiTypeKVTagInput
                name="spec.additionalRoutes"
                tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
                multiTypeProps={{
                  expressions,
                  allowableTypes
                }}
                type={getString('tagLabel')}
                label={getString('cd.steps.tas.additionalRoutes')}
                enableConfigureOptions
                isArray={true}
              />
            </div>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const TasCanaryAppSetupWidgetWithRef = React.forwardRef(TasCanaryAppSetupWidget)
