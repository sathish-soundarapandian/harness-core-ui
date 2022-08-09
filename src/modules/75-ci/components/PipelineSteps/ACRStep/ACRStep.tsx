/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes, IconName } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { ACRStepBaseWithRef } from './ACRStepBase'
import { ACRStepInputSet } from './ACRStepInputSet'
import { ACRStepVariables, ACRStepVariablesProps } from './ACRStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './ACRStepFunctionConfigs'

export interface ACRStepSpec {
  connectorRef: string
  repository: string
  tags: MultiTypeListType
  optimize?: boolean
  dockerfile?: string
  context?: string
  labels?: MultiTypeMapType
  buildArgs?: MultiTypeMapType
  target?: string
  remoteCacheImage?: string
  // Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
  runAsUser?: string
}

export interface ACRStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: ACRStepSpec
}

export interface ACRStepSpecUI
  extends Omit<ACRStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
  // Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface ACRStepDataUI extends Omit<ACRStepData, 'spec'> {
  spec: ACRStepSpecUI
}

export interface ACRStepProps {
  initialValues: ACRStepData
  template?: ACRStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: ACRStepData) => void
  onChange?: (data: ACRStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class ACRStep extends PipelineStep<ACRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.ACR
  protected stepName = 'Build and Push to ACR'
  protected stepIcon: IconName = 'azure-container-registry'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ACR'
  protected stepAdditionalInfo: keyof StringsMap = 'pipeline.linuxOnly'
  protected stepPaletteVisible = false

  protected defaultValues: ACRStepData = {
    identifier: '',
    type: StepType.ACR as string,
    spec: {
      connectorRef: '',
      remoteCacheImage: '',
      repository: '',
      tags: []
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): ACRStepData {
    return getFormValuesInCorrectFormat<T, ACRStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ACRStepData>): FormikErrors<ACRStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<ACRStepData>): JSX.Element {
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

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ACRStepInputSet
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
        <ACRStepVariables
          {...(customStepProps as ACRStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ACRStepBaseWithRef
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
