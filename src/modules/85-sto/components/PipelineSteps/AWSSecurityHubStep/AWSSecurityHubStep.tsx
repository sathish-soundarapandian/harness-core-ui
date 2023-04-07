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
import { AWSSecurityHubStepBaseWithRef } from './AWSSecurityHubStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { AWSSecurityHubStepVariables, AWSSecurityHubStepVariablesProps } from './AWSSecurityHubStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './AWSSecurityHubStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type AWSSecurityHubStepData = SecurityStepData<SecurityStepSpec>
export interface AWSSecurityHubStepProps {
  initialValues: AWSSecurityHubStepData
  template?: AWSSecurityHubStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: AWSSecurityHubStepData) => void
  onChange?: (data: AWSSecurityHubStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class AWSSecurityHubStep extends PipelineStep<AWSSecurityHubStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.AWSSecurityHub
  protected stepName = 'Configure AWSSecurityHub'
  protected stepIcon: IconName = 'aws-security-hub'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.AWSSecurityHub'
  protected stepPaletteVisible = false

  protected defaultValues: AWSSecurityHubStepData = {
    identifier: '',
    type: StepType.AWSSecurityHub as string,
    spec: {
      mode: 'extraction',
      config: 'default',
      target: {
        type: 'configuration',
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
  processFormData(data: AWSSecurityHubStepData): AWSSecurityHubStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AWSSecurityHubStepData>): FormikErrors<AWSSecurityHubStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<AWSSecurityHubStepData>): JSX.Element {
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
        <AWSSecurityHubStepVariables
          {...(customStepProps as AWSSecurityHubStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <AWSSecurityHubStepBaseWithRef
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
