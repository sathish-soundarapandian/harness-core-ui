/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'

import { defaultTo, isEmpty } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, TasSwapRollbackStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import type { StringsMap } from 'stringTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface SwapRollbackData extends StepElementConfig {
  spec: TasSwapRollbackStepInfo
}

export interface SwapRollbackVariableStepProps {
  initialValues: SwapRollbackData
  stageIdentifier: string
  onUpdate?(data: SwapRollbackData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SwapRollbackData
}

interface SwapRollbackProps {
  initialValues: SwapRollbackData
  onUpdate?: (data: SwapRollbackData) => void
  onChange?: (data: SwapRollbackData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: SwapRollbackData
    path?: string
    readonly?: boolean
  }
}

function SwapRollbackWidget(
  props: SwapRollbackProps,
  formikRef: StepFormikFowardRef<SwapRollbackData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<SwapRollbackData>
        onSubmit={(values: SwapRollbackData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        formName="TasSwapRollback"
        initialValues={initialValues}
        validate={data => {
          /* istanbul ignore next */
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<SwapRollbackData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          return (
            <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
              {stepViewType !== StepViewType.Template && (
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
                  multiTypeDurationProps={{
                    enableConfigureOptions: false,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.timeout as string}
                    type="String"
                    variableName="step.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('timeout', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  multiTypeTextbox={{ expressions, allowableTypes }}
                  name="spec.upsizeInActiveApp"
                  label={getString('cd.steps.tas.upsizeInactiveService')}
                  disabled={readonly}
                />
              </div>
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )
}

const SwapRollbackInputStep: React.FC<SwapRollbackProps> = ({ inputSetData, allowableTypes, stepViewType }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string =>
    `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}${fieldName}`

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            name={getNameEntity('timeout')}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes: allowableTypes,
              expressions,
              disabled: inputSetData?.readonly
            }}
            disabled={inputSetData?.readonly}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}

      {
        /* istanbul ignore next */ getMultiTypeFromValue(inputSetData?.template?.spec?.upsizeInActiveApp) ===
          MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormMultiTypeCheckboxField
              multiTypeTextbox={{
                expressions,
                allowableTypes: allowableTypes
              }}
              name={getNameEntity('spec.upsizeInActiveApp')}
              label={getString('cd.steps.tas.upsizeInactiveService')}
              disabled={inputSetData?.readonly}
              setToFalseWhenEmpty={true}
            />
          </div>
        )
      }
    </>
  )
}

const SwapRollbackWidgetWithRef = React.forwardRef(SwapRollbackWidget)
export class SwapRollbackStep extends PipelineStep<SwapRollbackData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<SwapRollbackData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <SwapRollbackInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as SwapRollbackVariableStepProps
      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }
    return (
      <SwapRollbackWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SwapRollbackData>): FormikErrors<SwapRollbackData> {
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        /* istanbul ignore next */
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
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
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  protected type = StepType.SwapRollback
  protected stepName = 'Swap Rollback'
  protected stepIcon: IconName = 'tasSwapRollback'
  protected referenceId = 'SwapRollbackStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SwapRollback'

  protected defaultValues: SwapRollbackData = {
    identifier: '',
    name: '',
    type: StepType.SwapRollback,
    timeout: '10m',
    spec: {
      upsizeInActiveApp: false
    }
  }
}
