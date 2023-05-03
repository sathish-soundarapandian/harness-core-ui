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

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { AwsSAMDeployStepInitialValues } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { GenericExecutionStepInputSet } from '../../Common/GenericExecutionStep/GenericExecutionStepInputSet'
import { AwsSAMDeployStepEditRef } from './AwsSAMDeployStepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AwsSAMDeployStepEditProps {
  initialValues: AwsSAMDeployStepInitialValues
  onUpdate?: (data: AwsSAMDeployStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsSAMDeployStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: AwsSAMDeployStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface AwsSAMDeployVariableStepProps {
  initialValues: AwsSAMDeployStepInitialValues
  stageIdentifier: string
  onUpdate?(data: AwsSAMDeployStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AwsSAMDeployStepInitialValues
}

export class AwsSAMDeployStep extends PipelineStep<AwsSAMDeployStepInitialValues> {
  protected type = StepType.AwsSAMDeploy
  protected stepName = 'AWS Lambda Deploy Step'
  protected stepIcon: IconName = 'aws-lambda-deploy'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AwsSAMDeploy'
  protected isHarnessSpecific = false
  protected referenceId = 'AwsSAMDeployStep'

  protected defaultValues: AwsSAMDeployStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.AwsSAMDeploy,
    timeout: '10m',
    spec: {
      connectorRef: '',
      image: '',
      imagePullPolicy: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<AwsSAMDeployStepInitialValues>): JSX.Element {
    const {
      initialValues,
      stepViewType,
      inputSetData,
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
          inputSetData={inputSetData as InputSetData<AwsSAMDeployStepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AwsSAMDeployVariableStepProps
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
      <AwsSAMDeployStepEditRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        onChange={onChange}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AwsSAMDeployStepInitialValues>): FormikErrors<AwsSAMDeployStepInitialValues> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<AwsSAMDeployStepInitialValues>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
