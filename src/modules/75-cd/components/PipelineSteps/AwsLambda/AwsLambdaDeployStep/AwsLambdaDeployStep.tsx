/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { IconName, AllowedTypes } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { GenericExecutionStepEditRef } from '../../Common/GenericExecutionStep/GenericExecutionStepEdit'
import { GenericExecutionStepInputSet } from '../../Common/GenericExecutionStep/GenericExecutionStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AwsLambdaDeployStepEditProps {
  initialValues: StepElementConfig
  onUpdate?: (data: StepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: StepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
}

export interface AwsLambdaDeployVariableStepProps {
  initialValues: StepElementConfig
  stageIdentifier: string
  onUpdate?(data: StepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: StepElementConfig
}

export class AwsLambdaDeployStep extends PipelineStep<StepElementConfig> {
  protected type = StepType.AwsLambdaDeploy
  protected stepName = 'AWS Lambda Deploy Step'
  protected stepIcon: IconName = 'aws-lambda-deploy'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AwsLambdaDeploy'
  protected isHarnessSpecific = false
  protected referenceId = 'awsLambdaDeployStep'

  protected defaultValues: StepElementConfig = {
    identifier: '',
    name: '',
    type: StepType.AwsLambdaDeploy,
    timeout: '10m',
    spec: {}
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<StepElementConfig>): JSX.Element {
    const {
      initialValues,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onUpdate,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <GenericExecutionStepInputSet
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          inputSetData={inputSetData as InputSetData<StepElementConfig>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AwsLambdaDeployVariableStepProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <GenericExecutionStepEditRef
        formikFormName={'awsLambdaDeployStep'}
        initialValues={initialValues}
        onUpdate={onUpdate}
        onChange={onChange}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
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
  }: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<StepElementConfig>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
