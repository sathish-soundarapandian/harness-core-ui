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
import type { AwsSamBuildStepInitialValues } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { GenericExecutionStepInputSet } from '../../Common/GenericExecutionStep/GenericExecutionStepInputSet'
import { AwsSamBuildStepEditRef } from './AwsSamBuildStepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AwsSamBuildStepEditProps {
  initialValues: AwsSamBuildStepInitialValues
  onUpdate?: (data: AwsSamBuildStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsSamBuildStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: AwsSamBuildStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface AwsSamBuildVariableStepProps {
  initialValues: AwsSamBuildStepInitialValues
  stageIdentifier: string
  onUpdate?(data: AwsSamBuildStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AwsSamBuildStepInitialValues
}

export class AwsSamBuildStep extends PipelineStep<AwsSamBuildStepInitialValues> {
  protected type = StepType.AwsSamBuild
  protected stepName = 'AWS SAM Build Step'
  protected stepIcon: IconName = 'aws-lambda-deploy'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AwsSamBuild'
  protected isHarnessSpecific = false
  protected referenceId = 'AwsSamBuildStep'

  protected defaultValues: AwsSamBuildStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.AwsSamBuild,
    timeout: '10m',
    spec: {
      connectorRef: '',
      samBuildDockerRegistryConnectorRef: '',
      image: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<AwsSamBuildStepInitialValues>): JSX.Element {
    const {
      initialValues,
      stepViewType,
      inputSetData,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onUpdate,
      onChange,
      formikRef
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      // @Todo: Implement Runtime view component and use it here
      return (
        <GenericExecutionStepInputSet
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          inputSetData={inputSetData as InputSetData<AwsSamBuildStepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AwsSamBuildVariableStepProps
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
      <AwsSamBuildStepEditRef
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
  }: ValidateInputSetProps<AwsSamBuildStepInitialValues>): FormikErrors<AwsSamBuildStepInitialValues> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<AwsSamBuildStepInitialValues>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
