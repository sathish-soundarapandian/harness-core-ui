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
import type { StepElementConfig, TasSwapRoutesStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
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

interface SwapRouteData extends StepElementConfig {
  spec: TasSwapRoutesStepInfo
}

export interface SwapRouteVariableStepProps {
  initialValues: SwapRouteData
  stageIdentifier: string
  onUpdate?(data: SwapRouteData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SwapRouteData
}

interface SwapRouteProps {
  initialValues: SwapRouteData
  onUpdate?: (data: SwapRouteData) => void
  onChange?: (data: SwapRouteData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: SwapRouteData
    path?: string
    readonly?: boolean
  }
}

function SwapRouteWidget(props: SwapRouteProps, formikRef: StepFormikFowardRef<SwapRouteData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<SwapRouteData>
        onSubmit={(values: SwapRouteData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        formName="swapRoute"
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
        {(formik: FormikProps<SwapRouteData>) => {
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
                    enableConfigureOptions: true,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  multiTypeTextbox={{ expressions, allowableTypes }}
                  name="spec.downSizeOldApplication"
                  label={getString('cd.steps.tas.enableDownSizeOldApplication')}
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

const SwapRouteInputStep: React.FC<SwapRouteProps> = ({ inputSetData, allowableTypes, stepViewType }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string =>
    `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}${fieldName}`

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
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
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      {
        /* istanbul ignore next */ getMultiTypeFromValue(inputSetData?.template?.spec?.downSizeOldApplication) ===
          MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormMultiTypeCheckboxField
              multiTypeTextbox={{
                expressions,
                allowableTypes: allowableTypes
              }}
              name={getNameEntity('spec.downSizeOldApplication')}
              label={getString('cd.steps.tas.enableDownSizeOldApplication')}
              disabled={inputSetData?.readonly}
              setToFalseWhenEmpty={true}
            />
          </div>
        )
      }
    </>
  )
}

const SwapRouteWidgetWithRef = React.forwardRef(SwapRouteWidget)
export class SwapRouteStep extends PipelineStep<SwapRouteData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<SwapRouteData>): JSX.Element {
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
        <SwapRouteInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as SwapRouteVariableStepProps

      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />
      )
    }
    return (
      <SwapRouteWidgetWithRef
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
  }: ValidateInputSetProps<SwapRouteData>): FormikErrors<SwapRouteData> {
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

  protected type = StepType.SwapRoutes
  protected stepName = 'Swap Routes'
  protected stepIcon: IconName = 'tasSwapRoute'
  protected referenceId = 'swapRouteStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SwapRoute'

  protected defaultValues: SwapRouteData = {
    identifier: '',
    name: '',
    type: StepType.SwapRoutes,
    timeout: '10m',
    spec: {
      downSizeOldApplication: false
    }
  }
}
