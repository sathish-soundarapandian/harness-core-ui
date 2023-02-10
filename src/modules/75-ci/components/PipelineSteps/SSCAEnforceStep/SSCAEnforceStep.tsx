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
import { SSCAEnforceStepBaseWithRef } from './SSCAEnforceStepBase'
import { SSCAEnforceStepInputSet } from './SSCAEnforceStepInputSet'
import { SSCAEnforceStepVariables, SSCAEnforceStepVariablesProps } from './SSCAEnforceStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SSCAEnforceStepFunctionConfigs'

export interface SSCAEnforceStepSpec {
  publicKey: string
  abort: {
    signatureVerificaionFailure: boolean
    sbomPartOfDenyList: boolean
    sbomComponentPartOfDenyList: boolean
    sourceNotPartOfAllowList: boolean
  }
}

export interface SSCAEnforceStepData {
  identifier: string
  name?: string
  type: string
  spec: SSCAEnforceStepSpec
}

export interface SSCAEnforceStepSpecUI extends Omit<SSCAEnforceStepSpec, 'abort'> {
  test?: MultiTypeListUIType
}

// Interface for the form
export interface SSCAEnforceStepDataUI extends Omit<SSCAEnforceStepData, 'spec'> {
  spec: SSCAEnforceStepSpecUI
}

export interface SSCAEnforceStepProps {
  initialValues: SSCAEnforceStepData
  template?: SSCAEnforceStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SSCAEnforceStepData) => void
  onChange?: (data: SSCAEnforceStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SSCAEnforceStep extends PipelineStep<SSCAEnforceStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SSCAEnforce
  protected stepName = 'Enforce SSCA'
  protected stepIcon: IconName = 'sscs-enforce'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SSCAEnforce'

  protected stepPaletteVisible = false

  protected defaultValues: SSCAEnforceStepData = {
    identifier: '',
    type: StepType.SSCAEnforce as string,
    spec: {
      publicKey: '',
      abort: {
        signatureVerificaionFailure: true,
        sbomPartOfDenyList: true,
        sbomComponentPartOfDenyList: true,
        sourceNotPartOfAllowList: true
      }
    }
  }

  processFormData<T>(data: T): SSCAEnforceStepData {
    return getFormValuesInCorrectFormat<T, SSCAEnforceStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SSCAEnforceStepData>): FormikErrors<SSCAEnforceStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SSCAEnforceStepData>): JSX.Element {
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
        <SSCAEnforceStepInputSet
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
        <SSCAEnforceStepVariables
          {...(customStepProps as SSCAEnforceStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SSCAEnforceStepBaseWithRef
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
