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
import { AWSECRStepBaseWithRef } from './AWSECRStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { AWSECRStepVariables, AWSECRStepVariablesProps } from './AWSECRStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './AWSECRStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type AWSECRStepData = SecurityStepData<SecurityStepSpec>
export interface AWSECRStepProps {
  initialValues: AWSECRStepData
  template?: AWSECRStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: AWSECRStepData) => void
  onChange?: (data: AWSECRStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class AWSECRStep extends PipelineStep<AWSECRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.AWSECR
  protected stepName = 'Configure AWSECR'
  protected stepIcon: IconName = 'ecr-step'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.AWSECR'
  protected stepPaletteVisible = false

  protected defaultValues: AWSECRStepData = {
    identifier: '',
    type: StepType.AWSECR as string,
    spec: {
      mode: 'extraction',
      config: 'default',
      target: {
        type: 'container',
        name: '',
        variant: '',
        workspace: ''
      },
      auth: {
        access_token: ''
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
  processFormData(data: AWSECRStepData): AWSECRStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AWSECRStepData>): FormikErrors<AWSECRStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<AWSECRStepData>): JSX.Element {
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
        <AWSECRStepVariables
          {...(customStepProps as AWSECRStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <AWSECRStepBaseWithRef
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
