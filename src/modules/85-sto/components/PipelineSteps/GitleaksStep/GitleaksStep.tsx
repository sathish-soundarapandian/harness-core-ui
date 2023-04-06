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
import type { StringsMap } from 'stringTypes'
import { GitleaksStepBaseWithRef } from './GitleaksStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { GitleaksStepVariables, GitleaksStepVariablesProps } from './GitleaksStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GitleaksStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type GitleaksStepData = SecurityStepData<SecurityStepSpec>
export interface GitleaksStepProps {
  initialValues: GitleaksStepData
  template?: GitleaksStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: GitleaksStepData) => void
  onChange?: (data: GitleaksStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class GitleaksStep extends PipelineStep<GitleaksStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Gitleaks
  protected stepName = 'Configure Gitleaks'
  protected stepIcon: IconName = 'gitleaks'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Gitleaks'
  protected stepPaletteVisible = false

  protected defaultValues: GitleaksStepData = {
    identifier: '',
    type: StepType.Gitleaks as string,
    spec: {
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'repository',
        name: '',
        variant: '',
        workspace: ''
      },
      advanced: {
        log: {
          level: 'info'
        }
      }
    }
  }

  /* istanbul ignore next */
  processFormData(data: GitleaksStepData): GitleaksStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<GitleaksStepData>): FormikErrors<GitleaksStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<GitleaksStepData>): JSX.Element {
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
        <SecurityStepInputSet
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
        <GitleaksStepVariables
          {...(customStepProps as GitleaksStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GitleaksStepBaseWithRef
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
