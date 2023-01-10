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
import { BanditStepBaseWithRef } from './BanditStepBase'
import { BanditStepInputSet } from './BanditStepInputSet'
import { BanditStepVariables, BanditStepVariablesProps } from './BanditStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './BanditStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type BanditStepData = SecurityStepData<SecurityStepSpec>
export interface BanditStepProps {
  initialValues: BanditStepData
  template?: BanditStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: BanditStepData) => void
  onChange?: (data: BanditStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class BanditStep extends PipelineStep<BanditStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Bandit
  protected stepName = 'Configure Bandit'
  protected stepIcon: IconName = 'bandit'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Bandit'
  protected stepPaletteVisible = false

  protected defaultValues: BanditStepData = {
    identifier: '',
    type: StepType.Bandit as string,
    spec: {
      privileged: true,
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'repository',
        name: '',
        variant: '',
        workspace: '',
        ssl: true
      },
      advanced: {
        log: {
          level: 'DEBUG',
          serializer: 'SIMPLE_ONPREM'
        }
      }
    }
  }

  /* istanbul ignore next */
  processFormData(data: BanditStepData): BanditStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<BanditStepData>): FormikErrors<BanditStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<BanditStepData>): JSX.Element {
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

    switch (stepViewType) {
      case StepViewType.InputSet:
      case StepViewType.DeploymentForm:
        return (
          <BanditStepInputSet
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

      case StepViewType.InputVariable:
        return (
          <BanditStepVariables
            {...(customStepProps as BanditStepVariablesProps)}
            initialValues={initialValues}
            onUpdate={onUpdate}
          />
        )
    }

    return (
      <BanditStepBaseWithRef
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
