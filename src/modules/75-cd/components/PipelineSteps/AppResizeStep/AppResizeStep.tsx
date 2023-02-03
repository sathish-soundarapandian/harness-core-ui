/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { defaultTo, isEmpty, set } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, TasAppResizeStepInfo } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StringsMap } from 'stringTypes'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormInstanceDropdown, getInstanceDropdownSchema, InstanceTypes } from './InstanceDropdownField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AppResizeData extends StepElementConfig {
  spec: TasAppResizeStepInfo
  identifier: string
}

export interface AppResizeVariableStepProps {
  initialValues: AppResizeData
  stageIdentifier: string
  onUpdate?(data: AppResizeData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AppResizeData
}

interface AppResizeProps {
  initialValues: AppResizeData
  onUpdate?: (data: AppResizeData) => void
  onChange?: (data: AppResizeData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: AppResizeData
  readonly?: boolean
  path?: string
}

function AppResizeWidget(props: AppResizeProps, formikRef: StepFormikFowardRef<AppResizeData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<AppResizeData>
        onSubmit={(values: AppResizeData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        validate={(values: AppResizeData) => {
          const getOldAppInstance = values.spec.oldAppInstances?.spec
          /* istanbul ignore next */
          if (!(getOldAppInstance?.value || getOldAppInstance?.value === 0)) {
            set(values, 'spec.oldAppInstances', undefined)
          }
          /* istanbul ignore next */
          onChange?.(values)
        }}
        formName="TasAppResize"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            newAppInstances: getInstanceDropdownSchema(
              {
                required: true,
                requiredErrorMessage: getString('fieldRequired', { field: getString('cd.steps.tas.totalInstances') })
              },
              getString
            ),
            oldAppInstances: getInstanceDropdownSchema({}, getString)
          })
        })}
      >
        {(formik: FormikProps<AppResizeData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              {stepViewType === StepViewType.Template ? null : (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
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
                  disabled={readonly}
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={stepCss.duration}
                  multiTypeDurationProps={{
                    expressions,
                    enableConfigureOptions: true,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>
              <div className={stepCss.divider} />
              <div className={cx(stepCss.formGroup)}>
                <FormInstanceDropdown
                  name={'spec.newAppInstances'}
                  label={getString('cd.steps.tas.totalInstances')}
                  readonly={readonly}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                />
                {getMultiTypeFromValue(values.spec.newAppInstances.spec?.value) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={defaultTo(values.spec.newAppInstances.spec?.value, '0')}
                    type="String"
                    variableName={getString('cd.steps.tas.totalInstances')}
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        setFieldValue('newAppInstances', value)
                      }
                    }
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup)}>
                <FormInstanceDropdown
                  name={'spec.oldAppInstances'}
                  label={getString('cd.steps.tas.oldAppInstances')}
                  readonly={readonly}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  defaultValue={{ type: InstanceTypes.Percentage, spec: { value: '' } }}
                />
                {getMultiTypeFromValue(values.spec.oldAppInstances?.spec?.value) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={defaultTo(values.spec.oldAppInstances?.spec?.value, '0')}
                    type="String"
                    variableName={getString('cd.steps.tas.oldAppInstances')}
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        setFieldValue('oldAppInstances', value)
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
    </>
  )
}

const AppResizeInputStep: React.FC<AppResizeProps> = ({ template, readonly, path, allowableTypes, stepViewType }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.newAppInstances?.spec?.value) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup)}>
          <FormInstanceDropdown
            expressions={expressions}
            label={getString('cd.steps.tas.totalInstances')}
            name={`${prefix}spec.newAppInstances`}
            allowableTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            disabledType
            readonly={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.spec?.oldAppInstances?.spec?.value) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup)}>
          <FormInstanceDropdown
            expressions={expressions}
            label={getString('cd.steps.tas.oldAppInstances')}
            name={`${prefix}spec.oldAppInstances`}
            allowableTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            disabledType
            readonly={readonly}
          />
        </div>
      )}
    </>
  )
}

const AppResizeVariableStep: React.FC<AppResizeVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return (
    <VariablesListTable
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const AppResizeWidgetWithRef = React.forwardRef(AppResizeWidget)
export class AppResizeStep extends PipelineStep<AppResizeData> {
  protected type = StepType.AppResize
  protected stepName = 'App Resize'
  protected referenceId = 'appResizeStep'
  protected stepIcon: IconName = 'tasAppResize'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AppResize'
  protected isHarnessSpecific = false
  protected defaultValues: AppResizeData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.AppResize,
    spec: {
      newAppInstances: {
        type: InstanceTypes.Percentage,
        spec: { value: '100' }
      }
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AppResizeData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AppResizeInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          readonly={inputSetData?.readonly}
          path={inputSetData?.path}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AppResizeVariableStep
          {...(customStepProps as AppResizeVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <AppResizeWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        allowableTypes={allowableTypes}
        onChange={onChange}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AppResizeData>): FormikErrors<AppResizeData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(/* istanbul ignore next */ getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.spec?.newAppInstances?.spec?.value) === MultiTypeInputType.RUNTIME) {
      const newAppInstances = Yup.object().shape({
        newAppInstances: getInstanceDropdownSchema(
          {
            required: true,
            requiredErrorMessage: /* istanbul ignore next */ getString?.('fieldRequired', {
              field: getString('cd.steps.tas.newAppInstance')
            })
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          getString!
        )
      })

      try {
        newAppInstances.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore next */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors.spec, err)
        }
      }
    }
    /* istanbul ignore next  */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
