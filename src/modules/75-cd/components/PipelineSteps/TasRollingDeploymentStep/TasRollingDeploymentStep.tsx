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
import type { StepElementConfig, TasRollingDeployStepInfo } from 'services/cd-ng'
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
import type { StringsMap } from 'stringTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface TasRollingDeploymentData extends StepElementConfig {
  spec: TasRollingDeployStepInfo
}

export interface TasRollingDeploymentVariableStepProps {
  initialValues: TasRollingDeploymentData
  stageIdentifier: string
  onUpdate?(data: TasRollingDeploymentData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TasRollingDeploymentData
}

interface TasRollingDeploymentProps {
  initialValues: TasRollingDeploymentData
  onUpdate?: (data: TasRollingDeploymentData) => void
  onChange?: (data: TasRollingDeploymentData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: TasRollingDeploymentData
  path?: string
}

function TasRollingDeploymentWidget(
  props: TasRollingDeploymentProps,
  formikRef: StepFormikFowardRef<TasRollingDeploymentData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<TasRollingDeploymentData>
        onSubmit={(values: TasRollingDeploymentData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        formName="TasRollingDeployment"
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
        {(formik: FormikProps<TasRollingDeploymentData>) => {
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

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormMultiTypeKVTagInput
                  name="spec.additionalRoutes"
                  tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
                  multiTypeProps={{
                    allowableTypes
                  }}
                  label={getString('cd.steps.tas.additionalRoutes')}
                  enableConfigureOptions
                  isArray={true}
                />
              </div>
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )
}

const TasRollingDeploymentInputStep: React.FC<TasRollingDeploymentProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string => `${isEmpty(path) ? '' : `${path}.`}${fieldName}`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          name={getNameEntity('timeout')}
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes: allowableTypes,
            expressions,
            disabled: readonly
          }}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue((template?.spec as any)?.additionalRoutes) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeKVTagInput
            name={getNameEntity('spec.additionalRoutes')}
            tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
            multiTypeProps={{
              expressions,
              allowableTypes
            }}
            label={getString('cd.steps.tas.additionalRoutes')}
            enableConfigureOptions
            isArray={true}
          />
        </div>
      )}
    </>
  )
}

const TasRollingDeploymentWidgetWithRef = React.forwardRef(TasRollingDeploymentWidget)
export class TasRollingDeploymentStep extends PipelineStep<TasRollingDeploymentData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<TasRollingDeploymentData>): JSX.Element {
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
        <TasRollingDeploymentInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as TasRollingDeploymentVariableStepProps

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
      <TasRollingDeploymentWidgetWithRef
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
  }: ValidateInputSetProps<TasRollingDeploymentData>): FormikErrors<TasRollingDeploymentData> {
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

  protected type = StepType.TasRollingDeploy
  protected stepName = 'Rolling Deployment'
  protected stepIcon: IconName = 'tasRollingSetup'
  protected referenceId = 'TasRollingDeploymentStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.RollingDeployment'

  protected defaultValues: TasRollingDeploymentData = {
    identifier: '',
    name: '',
    type: StepType.TasRollingDeploy,
    timeout: '10m',
    spec: {}
  }
}
