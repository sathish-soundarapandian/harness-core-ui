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
import { defaultTo, get, has, isEmpty } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { FormInstanceDropdown } from '@common/components'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StringsMap } from 'stringTypes'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { getSanitizedflatObjectForVariablesView } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface AsgCanaryDeployData extends StepElementConfig {
  spec: any
  identifier: string
}

interface AsgCanaryDeployVariableStepProps {
  initialValues: AsgCanaryDeployData
  stageIdentifier: string
  onUpdate?(data: AsgCanaryDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgCanaryDeployData
}

interface AsgCanaryDeployProps {
  initialValues: AsgCanaryDeployData
  onUpdate?: (data: AsgCanaryDeployData) => void
  onChange?: (data: AsgCanaryDeployData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: AsgCanaryDeployData
  readonly?: boolean
  path?: string
}

function AsgCanaryDeployWidget(
  props: AsgCanaryDeployProps,
  formikRef: StepFormikFowardRef<AsgCanaryDeployData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<AsgCanaryDeployData>
      onSubmit={(values: AsgCanaryDeployData) => {
        onUpdate && onUpdate(values)
      }}
      validate={(values: AsgCanaryDeployData) => {
        onChange && onChange(values)
      }}
      formName="AsgCanaryDeploy"
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          instanceSelection: getInstanceDropdownSchema({ required: true }, getString)
        })
      })}
    >
      {(formik: FormikProps<AsgCanaryDeployData>) => {
        const { values, setFieldValue } = formik
        setFormikRef(formikRef, formik)
        return (
          <>
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
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInstanceDropdown
                name={'spec.instanceSelection'}
                label={getString('common.instanceLabel')}
                readonly={readonly}
                expressions={expressions}
                allowableTypes={allowableTypes}
                disabledType
              />
              {(getMultiTypeFromValue(get(values, 'spec.instanceSelection.spec.count')) ===
                MultiTypeInputType.RUNTIME ||
                getMultiTypeFromValue(get(values, 'spec.instanceSelection.spec.percentage')) ===
                  MultiTypeInputType.RUNTIME) && (
                <ConfigureOptions
                  value={
                    get(values, 'spec.instanceSelection.spec.count') ||
                    get(values, 'spec.instanceSelection.spec.percentage')
                  }
                  type="String"
                  variableName={getString('instanceFieldOptions.instances')}
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => {
                    setFieldValue('spec.instanceSelection.spec.count', value)
                  }}
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

const AsgCanaryDeployInputStep: React.FC<AsgCanaryDeployProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const isTemplateUsageView = stepViewType === StepViewType.TemplateUsage
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
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
          template={template}
          fieldPath={'timeout'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {(getMultiTypeFromValue(get(template, 'spec.instanceSelection.spec.count')) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(get(template, 'spec.instanceSelection.spec.percentage')) ===
          MultiTypeInputType.RUNTIME) && (
        <div className={cx(stepCss.formGroup, { [stepCss.md]: !isTemplateUsageView })}>
          <FormInstanceDropdown
            expressions={expressions}
            label={getString('common.instanceLabel')}
            name={`${prefix}spec.instanceSelection`}
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

const AsgCanaryDeployVariableStep: React.FC<AsgCanaryDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      data={getSanitizedflatObjectForVariablesView(variablesData.spec)}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const AsgCanaryDeployWidgetWithRef = React.forwardRef(AsgCanaryDeployWidget)
export class AsgCanaryDeployStep extends PipelineStep<AsgCanaryDeployData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AsgCanaryDeployData>): JSX.Element {
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
        <AsgCanaryDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={get(inputSetData, 'template')}
          readonly={get(inputSetData, 'readonly')}
          path={get(inputSetData, 'path')}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AsgCanaryDeployVariableStep
          {...(customStepProps as AsgCanaryDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <AsgCanaryDeployWidgetWithRef
        initialValues={initialValues}
        onUpdate={values => onUpdate?.(this.processFormData(values))}
        isNewStep={isNewStep}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        allowableTypes={allowableTypes}
        onChange={values => onChange?.(this.processFormData(values))}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  protected type = StepType.AsgCanaryDeploy
  protected stepName = 'Asg Canary Deploy'
  protected referenceId = 'AsgCanaryDeploy'
  protected stepIcon: IconName = 'asg-canary'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.K8sCanaryDeploy'
  protected isHarnessSpecific = false

  processFormData(values: AsgCanaryDeployData): AsgCanaryDeployData {
    if (
      get(values, 'spec.instanceSelection.type') === InstanceTypes.Instances &&
      has(values, 'spec.instanceSelection.spec.percentage')
    ) {
      /* istanbul ignore next */
      delete values.spec.instanceSelection.spec?.percentage
    }

    if (
      get(values, 'spec.instanceSelection.type') === InstanceTypes.Percentage &&
      has(values, 'spec.instanceSelection.spec.count')
    ) {
      /* istanbul ignore next */
      delete values.spec.instanceSelection.spec?.count
    }

    return values
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AsgCanaryDeployData>): FormikErrors<AsgCanaryDeployData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(get(template, 'timeout')) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired && getString) {
        timeoutSchema = timeoutSchema.required(getString('validation.timeout10SecMinimum'))
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
    if (
      (getMultiTypeFromValue(get(template, 'spec.instanceSelection.spec.count')) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(get(template, 'spec.instanceSelection.spec.percentage')) ===
          MultiTypeInputType.RUNTIME) &&
      getString
    ) {
      const instanceSelection = Yup.object().shape({
        instanceSelection: getInstanceDropdownSchema(
          {
            required: true,
            requiredErrorMessage: getString('fieldRequired', { field: 'Instance' })
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          getString!
        )
      })

      try {
        instanceSelection.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors.spec, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
  protected defaultValues: AsgCanaryDeployData = {
    identifier: '',
    timeout: '10s',
    name: '',
    type: StepType.AsgCanaryDeploy,
    spec: {
      instanceSelection: {
        type: InstanceTypes.Instances,
        spec: { count: 1 }
      }
    }
  }
}
