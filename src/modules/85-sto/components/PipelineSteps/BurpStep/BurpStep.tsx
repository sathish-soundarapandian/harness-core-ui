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
import { BurpStepBaseWithRef } from './BurpStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { BURP_DEFAULT_CONFIG, BurpStepVariables, BurpStepVariablesProps } from './BurpStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './BurpStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type BurpStepData = SecurityStepData<SecurityStepSpec>
export interface BurpStepProps {
  initialValues: BurpStepData
  template?: BurpStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: BurpStepData) => void
  onChange?: (data: BurpStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class BurpStep extends PipelineStep<BurpStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Burp
  protected stepName = 'Configure Burp'
  protected stepIcon: IconName = 'burp-suite'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Burp'
  protected stepPaletteVisible = false

  protected defaultValues: BurpStepData = {
    identifier: '',
    type: 'StepType.Burp' as string,
    spec: {
      mode: 'orchestration',
      config: BURP_DEFAULT_CONFIG.value,
      target: {
        type: 'instance',
        name: '',
        variant: '',
        workspace: ''
      },
      instance: {
        protocol: 'https'
      },
      advanced: {
        log: {
          level: 'info'
        }
      }
    }
  }

  /* istanbul ignore next */
  processFormData(data: BurpStepData): BurpStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<BurpStepData>): FormikErrors<BurpStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<BurpStepData>): JSX.Element {
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
          /* istanbul ignore next */
          template={inputSetData?.template}
          /* istanbul ignore next */
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
        <BurpStepVariables
          {...(customStepProps as BurpStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <BurpStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={
          stepViewType ||
          /* istanbul ignore next */
          StepViewType.Edit
        }
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
