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
import { GHAPluginStepBaseWithRef, customRegexForMultiTypeMap } from './GHAPluginStepBase'
import { GHAPluginStepInputSet } from './GHAPluginStepInputSet'
import { GHAPluginStepVariables, GHAPluginStepVariablesProps } from './GHAPluginStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GHAPluginStepFunctionConfigs'

export interface GHAPluginStepSpec {
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

export interface GHAPluginStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: GHAPluginStepSpec
}

export interface GHAPluginStepSpecUI extends Omit<GHAPluginStepSpec, 'reports' | 'with' | 'env' | 'resources'> {
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface GHAPluginStepDataUI extends Omit<GHAPluginStepData, 'spec'> {
  spec: GHAPluginStepSpecUI
}

export interface GHAPluginStepProps {
  initialValues: GHAPluginStepData
  template?: GHAPluginStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: GHAPluginStepData) => void
  onChange?: (data: GHAPluginStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class GHAPluginStep extends PipelineStep<GHAPluginStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.GHAPlugin
  protected stepName = 'Configure Github Action Plugin'
  protected stepIcon: IconName = 'github-actions'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.GHAPlugin'
  protected stepIconSize = 34

  protected stepPaletteVisible = false

  protected defaultValues: GHAPluginStepData = {
    identifier: '',
    type: StepType.GHAPlugin as string,
    spec: {
      uses: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): GHAPluginStepData {
    return getFormValuesInCorrectFormat<T, GHAPluginStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<GHAPluginStepData>): FormikErrors<GHAPluginStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(
        data,
        template,
        getInputSetViewValidateFieldsConfig(isRequired),
        { getString },
        viewType,
        customRegexForMultiTypeMap
      )
    }

    return {}
  }

  renderStep(props: StepProps<GHAPluginStepData>): JSX.Element {
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
        <GHAPluginStepInputSet
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
        <GHAPluginStepVariables
          {...(customStepProps as GHAPluginStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GHAPluginStepBaseWithRef
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
