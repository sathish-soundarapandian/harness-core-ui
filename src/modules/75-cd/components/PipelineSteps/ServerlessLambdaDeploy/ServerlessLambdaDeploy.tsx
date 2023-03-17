/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { IconName } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { ServerlessLambdaDeployStepEditRef } from './ServerlessLambdaDeployStepEdit'
import { ServerlessLambdaDeployStepInputSet } from './ServerlessLambdaDeployStepInputSet'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ServerlessLambdaDeployStepValues extends StepElementConfig {
  spec: {
    commandOptions?: string
  }
}

export interface ServerlessLambdaDeployVariableStepProps {
  initialValues: ServerlessLambdaDeployStepValues
  stageIdentifier: string
  onUpdate?(data: ServerlessLambdaDeployStepValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessLambdaDeployStepValues
}

const ServerlessLambdaDeployVariableStep: React.FC<ServerlessLambdaDeployVariableStepProps> = ({
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

export class ServerlessLambdaDeployStep extends PipelineStep<ServerlessLambdaDeployStepValues> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<ServerlessLambdaDeployStepValues>): JSX.Element {
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
        <ServerlessLambdaDeployStepInputSet
          initialValues={initialValues}
          onUpdate={onUpdate}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          inputSetData={inputSetData as InputSetData<ServerlessLambdaDeployStepValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <ServerlessLambdaDeployVariableStep
          {...(customStepProps as ServerlessLambdaDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ServerlessLambdaDeployStepEditRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        inputSetData={inputSetData as InputSetData<ServerlessLambdaDeployStepValues>}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ServerlessLambdaDeployStepValues>): FormikErrors<ServerlessLambdaDeployStepValues> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessLambdaDeployStepValues>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  protected type = StepType.ServerlessAwsLambdaDeploy
  protected stepName = 'Serverless Lambda Deploy Step'
  protected stepIcon: IconName = 'serverless-deploy-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessLambdaDeploy'
  protected isHarnessSpecific = false
  protected referenceId = 'serverlessDeployStep'

  protected defaultValues: ServerlessLambdaDeployStepValues = {
    identifier: '',
    name: '',
    type: StepType.ServerlessAwsLambdaDeploy,
    timeout: '10m',
    spec: {
      commandOptions: ''
    }
  }
}
