/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  Accordion,
  Text
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { defaultTo, isEmpty, set, toString } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { AsgRollingDeployStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StringsMap } from 'stringTypes'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { instanceWarmupSchema, minimumHealthyPercentageSchema } from './utils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AsgRollingDeployData extends StepElementConfig {
  spec: AsgRollingDeployStepInfo
  identifier: string
}

export interface AsgRollingDeployVariableStepProps {
  initialValues: AsgRollingDeployData
  onUpdate?(data: AsgRollingDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgRollingDeployData
}

interface AsgRollingDeployProps {
  initialValues: AsgRollingDeployData
  onUpdate?: (data: AsgRollingDeployData) => void
  onChange?: (data: AsgRollingDeployData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: AsgRollingDeployData
  readonly?: boolean
  path?: string
}

function AsgRollingDeployWidget(
  props: AsgRollingDeployProps,
  formikRef: StepFormikFowardRef<AsgRollingDeployData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<AsgRollingDeployData>
        onSubmit={(values: AsgRollingDeployData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        validate={(values: AsgRollingDeployData) => {
          /* istanbul ignore next */
          onChange?.(values)
        }}
        formName="AsgRollingDeploy"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            minimumHealthyPercentage: minimumHealthyPercentageSchema(getString),
            instanceWarmup: instanceWarmupSchema(getString)
          })
        })}
      >
        {(formik: FormikProps<AsgRollingDeployData>) => {
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
              <Text margin={{ bottom: 'medium' }}>{getString('instanceFieldOptions.instances')}</Text>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.useAlreadyRunningInstances"
                  label={getString('cd.useAlreadyRunningInstance')}
                  disabled={readonly}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                />
              </div>
              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('cd.instanceRefresh')}
                  details={
                    <>
                      <div className={cx(stepCss.formGroup, stepCss.lg)}>
                        <FormInput.MultiTextInput
                          name="spec.minimumHealthyPercentage"
                          placeholder={getString('cd.minimumHealthyPercentagePlaceholder')}
                          label={getString('cd.minimumHealthyPercentageLabel')}
                          disabled={readonly}
                          multiTextInputProps={{
                            expressions,
                            disabled: readonly,
                            allowableTypes,
                            textProps: { type: 'number' }
                          }}
                        />
                        {getMultiTypeFromValue(values.spec.minimumHealthyPercentage) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={toString(values.spec.minimumHealthyPercentage)}
                            type="Number"
                            variableName="spec.minimumHealthyPercentage"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={
                              /* istanbul ignore next */ value => setFieldValue('spec.minimumHealthyPercentage', value)
                            }
                            isReadonly={readonly}
                            allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
                          />
                        )}
                      </div>
                      <div className={cx(stepCss.formGroup, stepCss.lg)}>
                        <FormInput.MultiTextInput
                          name="spec.instanceWarmup"
                          placeholder={getString('cd.instanceWarmupPlaceholder')}
                          label={getString('cd.instanceWarmupLabel')}
                          disabled={readonly}
                          multiTextInputProps={{
                            expressions,
                            disabled: readonly,
                            allowableTypes,
                            textProps: { type: 'number' }
                          }}
                        />
                        {getMultiTypeFromValue(values.spec.instanceWarmup) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={toString(values.spec.instanceWarmup)}
                            type="Number"
                            variableName="spec.instanceWarmup"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={/* istanbul ignore next */ value => setFieldValue('spec.instanceWarmup', value)}
                            isReadonly={readonly}
                            allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
                          />
                        )}
                      </div>
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormMultiTypeCheckboxField
                          multiTypeTextbox={{ expressions, allowableTypes }}
                          name="spec.skipMatching"
                          label={getString('cd.skipMatchingLabel')}
                          disabled={readonly}
                        />
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

const AsgRollingDeployInputStep: React.FC<AsgRollingDeployProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
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
      {getMultiTypeFromValue(template?.spec?.useAlreadyRunningInstances) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.useAlreadyRunningInstances`}
            label={'Use Already Running Instances'}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.minimumHealthyPercentage) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.minimumHealthyPercentage`}
            multiTextInputProps={{
              textProps: { type: 'number' },
              allowableTypes,
              expressions,
              defaultValueToReset: 0
            }}
            label="Minimum Healthy Percentage"
            disabled={readonly}
            template={template}
            fieldPath={`spec.minimumHealthyPercentage`}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.instanceWarmup) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.instanceWarmup`}
            multiTextInputProps={{
              textProps: { type: 'number' },
              allowableTypes,
              expressions,
              defaultValueToReset: 0
            }}
            label="Instance Warmup"
            disabled={readonly}
            template={template}
            fieldPath={`spec.instanceWarmup`}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.skipMatching) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.skipMatching`}
            label={'skip Matching'}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}

const AsgRollingDeployVariableStep: React.FC<AsgRollingDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const AsgRollingDeployWidgetWithRef = React.forwardRef(AsgRollingDeployWidget)
export class AsgRollingDeploy extends PipelineStep<AsgRollingDeployData> {
  protected type = StepType.AsgRollingDeploy
  protected stepName = 'Asg Rolling Deploy'
  protected referenceId = 'asgRollingDeploy'
  protected stepIcon: IconName = 'asg-deploy'
  protected stepDescription: keyof StringsMap = 'cd.asgRollingDeployStepDescription'
  protected isHarnessSpecific = false
  protected defaultValues: AsgRollingDeployData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.AsgRollingDeploy,
    spec: {
      useAlreadyRunningInstances: false,
      skipMatching: true
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AsgRollingDeployData>): JSX.Element {
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
        <AsgRollingDeployInputStep
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
        <AsgRollingDeployVariableStep
          {...(customStepProps as AsgRollingDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <AsgRollingDeployWidgetWithRef
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
  }: ValidateInputSetProps<AsgRollingDeployData>): FormikErrors<AsgRollingDeployData> {
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
    if (getMultiTypeFromValue(template?.spec?.minimumHealthyPercentage) === MultiTypeInputType.RUNTIME) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            minimumHealthyPercentage: minimumHealthyPercentageSchema(getString!)
          })
        })
        schema.validateSync(data)
      } catch (error: any) {
        set(errors, 'spec.minimumHealthyPercentage', error.message)
      }
    }
    if (getMultiTypeFromValue(template?.spec?.instanceWarmup) === MultiTypeInputType.RUNTIME) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            instanceWarmup: instanceWarmupSchema(getString!)
          })
        })
        schema.validateSync(data)
      } catch (error: any) {
        set(errors, 'spec.instanceWarmup', error.message)
      }
    }
    /* istanbul ignore next  */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
