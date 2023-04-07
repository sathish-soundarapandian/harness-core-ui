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
import { ProwlerStepBaseWithRef } from './ProwlerStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { ProwlerStepVariables, ProwlerStepVariablesProps } from './ProwlerStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './ProwlerStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'
import { PROWLER_DEFAULT_CONFIG } from '../constants'

export type ProwlerStepData = SecurityStepData<SecurityStepSpec>
export interface ProwlerStepProps {
  initialValues: ProwlerStepData
  template?: ProwlerStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: ProwlerStepData) => void
  onChange?: (data: ProwlerStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class ProwlerStep extends PipelineStep<ProwlerStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Prowler
  protected stepName = 'Configure Prowler'
  protected stepIcon: IconName = 'prowler'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Prowler'
  protected stepPaletteVisible = false

  protected defaultValues: ProwlerStepData = {
    identifier: '',
    type: StepType.Prowler as string,
    spec: {
      mode: 'orchestration',
      config: PROWLER_DEFAULT_CONFIG.value,
      target: {
        type: 'configuration',
        name: '',
        variant: '',
        workspace: ''
      },
      auth: {
        domain: '',
        access_token: '',
        ssl: true
      },
      advanced: {
        log: {
          level: 'info'
        },
        args: {
          cli: ''
        }
      }
    }
  }

  /* istanbul ignore next */
  processFormData(data: ProwlerStepData): ProwlerStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ProwlerStepData>): FormikErrors<ProwlerStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<ProwlerStepData>): JSX.Element {
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
        <ProwlerStepVariables
          {...(customStepProps as ProwlerStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ProwlerStepBaseWithRef
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
