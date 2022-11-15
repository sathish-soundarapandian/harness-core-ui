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
import { SSCSGenerationStepBaseWithRef } from './SSCSGenerationStepBase'
import { SSCSGenerationStepInputSet } from './SSCSGenerationStepInputSet'
import { SSCSGenerationStepVariables, SSCSGenerationStepVariablesProps } from './SSCSGenerationStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SSCSGenerationStepFunctionConfigs'

export interface SSCSGenerationStepSpec {
  generationType: string
  artifactType: string
  sbomGenerationTool: string
  sbomFormat: string
  signed?: boolean
  signSecret?: string
}

export interface SSCSGenerationStepData {
  identifier: string
  name?: string
  type: string
  spec: SSCSGenerationStepSpec
}

export interface SSCSGenerationStepSpecUI
  extends Omit<SSCSGenerationStepSpec, 'generationType' | 'artifactType' | 'sbomGenerationTool'> {
  generationType?: MultiTypeListUIType
  artifactType?: MultiTypeListUIType
  sbomGenerationTool?: MultiTypeListUIType
}

// Interface for the form
export interface SSCSGenerationStepDataUI extends Omit<SSCSGenerationStepData, 'spec'> {
  spec: SSCSGenerationStepSpecUI
}

export interface SSCSGenerationStepProps {
  initialValues: SSCSGenerationStepData
  template?: SSCSGenerationStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SSCSGenerationStepData) => void
  onChange?: (data: SSCSGenerationStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SSCSGenerationStep extends PipelineStep<SSCSGenerationStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SSCSGeneration
  protected stepName = 'SBOM Generation'
  protected stepIcon: IconName = 'plugin-step'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SCSSGeneration'

  protected stepPaletteVisible = false

  protected defaultValues: SSCSGenerationStepData = {
    identifier: '',
    type: StepType.SSCSGeneration as string,
    spec: {
      generationType: 'Orchestrated',
      artifactType: 'Repository',
      sbomGenerationTool: 'Syft',
      sbomFormat: 'SPDX v2.2',
      signed: false
    }
  }

  processFormData<T>(data: T): SSCSGenerationStepData {
    return getFormValuesInCorrectFormat<T, SSCSGenerationStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SSCSGenerationStepData>): FormikErrors<SSCSGenerationStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SSCSGenerationStepData>): JSX.Element {
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
        <SSCSGenerationStepInputSet
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
        <SSCSGenerationStepVariables
          {...(customStepProps as SSCSGenerationStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SSCSGenerationStepBaseWithRef
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
