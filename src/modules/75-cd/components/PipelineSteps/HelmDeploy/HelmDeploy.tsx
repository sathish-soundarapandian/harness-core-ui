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
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'

import { isEmpty } from 'lodash-es'

import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { HelmDeployStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StringsMap } from 'stringTypes'

import { useStrings } from 'framework/strings'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { FormMultiTypeCheckboxField } from '@common/components'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface HelmDeployData extends StepElementConfig {
  spec: Omit<HelmDeployStepInfo, 'ignoreReleaseHistFailStatus'> & {
    ignoreReleaseHistFailStatus?: boolean
  }
}
interface HelmDeployProps {
  initialValues: HelmDeployData
  onUpdate?: (data: HelmDeployData) => void
  onChange?: (data: HelmDeployData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: HelmDeployData
    path?: string
    readonly?: boolean
  }
  isReadonly?: boolean
}

export interface HelmDeployVariableStepProps {
  initialValues: HelmDeployData
  stageIdentifier: string
  onUpdate?(data: HelmDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: HelmDeployData
}

const withUpdatedPayload = (values: HelmDeployData) => ({ ...values, spec: { ...values.spec, skipDryRun: false } })

function HelmDeployWidget(props: HelmDeployProps, formikRef: StepFormikFowardRef<HelmDeployData>): React.ReactElement {
  const { initialValues, onUpdate, onChange, allowableTypes, isNewStep = true, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<HelmDeployData>
        onSubmit={(values: HelmDeployData) => {
          /* istanbul ignore next */
          onUpdate?.(withUpdatedPayload(values))
        }}
        validate={(values: HelmDeployData) => {
          onChange?.(withUpdatedPayload(values))
        }}
        formName="helmDeploy"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<HelmDeployData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                {stepViewType !== StepViewType.Template && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    className={stepCss.duration}
                    multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
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
                        /* istanbul ignore next */
                        setFieldValue('timeout', value)
                      }}
                      isReadonly={props.isReadonly}
                      allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                    />
                  )}
                </div>
                <div className={stepCss.divider} />
                <div style={{ width: '51%' }}>
                  <FormMultiTypeCheckboxField
                    multiTypeTextbox={{ expressions, allowableTypes }}
                    name="spec.ignoreReleaseHistFailStatus"
                    label={getString('cd.ignoreReleaseHistFailStatus')}
                    setToFalseWhenEmpty={true}
                  />
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const HelmDeployInputStep: React.FC<HelmDeployProps> = ({ inputSetData, allowableTypes }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            disabled={inputSetData?.readonly}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: inputSetData?.readonly
            }}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.ignoreReleaseHistFailStatus) ===
        MultiTypeInputType.RUNTIME && (
        <div style={{ width: '50%' }}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.ignoreReleaseHistFailStatus`}
            label={getString('cd.ignoreReleaseHistFailStatus')}
            disabled={inputSetData?.readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}

const HelmDeployVariablesStep: React.FC<HelmDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}

const HelmDeployWithRef = React.forwardRef(HelmDeployWidget)
export class HelmDeploy extends PipelineStep<HelmDeployData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<HelmDeployData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <HelmDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <HelmDeployVariablesStep
          {...(customStepProps as HelmDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <HelmDeployWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        onChange={onChange}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        isReadonly={props.readonly}
      />
    )
  }

  protected type = StepType.HelmDeploy
  protected stepName = 'Helm Deploy'
  protected stepIcon: IconName = 'service-helm'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.HelmDeploy'
  protected referenceId = 'helmDeployStep'

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<HelmDeployData>): FormikErrors<HelmDeployData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
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
    return errors
  }

  protected defaultValues: HelmDeployData = {
    name: '',
    identifier: '',
    timeout: '10m',
    type: StepType.HelmDeploy,
    spec: {
      skipDryRun: false,
      ignoreReleaseHistFailStatus: false
    }
  }
}
