/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes, IconName } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeSelectOption,
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeConnectorRef,
  Resources,
  MultiTypeListUIType,
  MultiTypeListType
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { SSCAOrchestrateStepBaseWithRef } from './SSCAOrchestrateStepBase'
import { SSCAOrchestrateStepInputSet } from './SSCAOrchestrateStepInputSet'
import { SSCAOrchestrateStepVariables, SSCAOrchestrateStepVariablesProps } from './SSCAOrchestrateStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SSCAOrchestrateStepFunctionConfigs'

export interface SSCAOrchestrateStepSpec {
  generationType: string
  artifactType: string
  sbomGenerationTool: string
  sbomFormat: string
  signed?: boolean
  signSecret?: string
}

export interface SSCAOrchestrateStepData {
  identifier: string
  name?: string
  type: string
  spec: SSCAOrchestrateStepSpec
}

export interface SSCAOrchestrateStepSpecUI
  extends Omit<SSCAOrchestrateStepSpec, 'generationType' | 'artifactType' | 'sbomGenerationTool'> {
  generationType?: MultiTypeListUIType
  artifactType?: MultiTypeListUIType
  sbomGenerationTool?: MultiTypeListUIType
}

// Interface for the form
export interface SSCAOrchestrateStepDataUI extends Omit<SSCAOrchestrateStepData, 'spec'> {
  spec: SSCAOrchestrateStepSpecUI
}

export interface SSCAOrchestrateStepProps {
  initialValues: SSCAOrchestrateStepData
  template?: SSCAOrchestrateStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SSCAOrchestrateStepData) => void
  onChange?: (data: SSCAOrchestrateStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SSCAOrchestrateStep extends PipelineStep<SSCAOrchestrateStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SSCAOrchestrate
  protected stepName = 'Orchestrate SSCA'
  protected stepIcon: IconName = 'sscs-orchestrate'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SSCAOrchestrate'

  protected stepPaletteVisible = false

  protected defaultValues: SSCAOrchestrateStepData = {
    identifier: '',
    type: StepType.SSCAOrchestrate as string,
    spec: {
      generationType: 'Orchestrated',
      sbomGenerationTool: 'Syft',
      sbomFormat: 'SPDX v2.2',
      artifactType: 'image',
      signed: false
    }
  }

  processFormData<T>(data: T): SSCAOrchestrateStepData {
    return getFormValuesInCorrectFormat<T, SSCAOrchestrateStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SSCAOrchestrateStepData>): FormikErrors<SSCAOrchestrateStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SSCAOrchestrateStepData>): JSX.Element {
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
        <SSCAOrchestrateStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <SSCAOrchestrateStepVariables
          {...(customStepProps as SSCAOrchestrateStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SSCAOrchestrateStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
