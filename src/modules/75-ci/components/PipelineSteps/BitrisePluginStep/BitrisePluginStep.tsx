/*
 * Copyright 2022 Harness Inc. All rights reserved.
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
  MultiTypeMapType,
  Resources,
  MultiTypeListType
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { BitrisePluginStepBaseWithRef } from './BitrisePluginStepBase'
import { BitrisePluginStepInputSet } from './BitrisePluginStepInputSet'
import { BitrisePluginStepVariables, BitrisePluginStepVariablesProps } from './BitrisePluginStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './BitrisePluginStepFunctionConfigs'

export interface BitrisePluginStepSpec {
  uses: string
  reports?: {
    type: 'JUnit'
    spec: {
      paths: MultiTypeListType
    }
  }
  with?: MultiTypeMapType
  env?: MultiTypeMapType
  resources?: Resources
}

export interface BitrisePluginStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: BitrisePluginStepSpec
}

export interface BitrisePluginStepSpecUI extends Omit<BitrisePluginStepSpec, 'reports' | 'with' | 'env' | 'resources'> {
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface BitrisePluginStepDataUI extends Omit<BitrisePluginStepData, 'spec'> {
  spec: BitrisePluginStepSpecUI
}

export interface BitrisePluginStepProps {
  initialValues: BitrisePluginStepData
  template?: BitrisePluginStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: BitrisePluginStepData) => void
  onChange?: (data: BitrisePluginStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class BitrisePluginStep extends PipelineStep<BitrisePluginStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.BitrisePlugin
  protected stepName = 'Configure Bitrise Plugin'
  protected stepIcon: IconName = 'bitrise'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.BitrisePlugin'
  protected stepIconSize = 34

  protected stepPaletteVisible = false

  protected defaultValues: BitrisePluginStepData = {
    identifier: '',
    type: StepType.BitrisePlugin as string,
    spec: {
      uses: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): BitrisePluginStepData {
    return getFormValuesInCorrectFormat<T, BitrisePluginStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<BitrisePluginStepData>): FormikErrors<BitrisePluginStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<BitrisePluginStepData>): JSX.Element {
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
        <BitrisePluginStepInputSet
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
        <BitrisePluginStepVariables
          {...(customStepProps as BitrisePluginStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <BitrisePluginStepBaseWithRef
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
