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
import { BlackduckStepBaseWithRef } from './BlackduckStepBase'
import { BlackduckStepInputSet } from './BlackduckStepInputSet'
import { BlackduckStepVariables, BlackduckStepVariablesProps } from './BlackduckStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './BlackduckStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'
import { API_KEY_AUTH_TYPE, API_VERSION_5_0_2 } from '../constants'

export type BlackduckStepData = SecurityStepData<SecurityStepSpec>
export interface BlackduckStepProps {
  initialValues: BlackduckStepData
  template?: BlackduckStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: BlackduckStepData) => void
  onChange?: (data: BlackduckStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class BlackduckStep extends PipelineStep<BlackduckStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.BlackDuck
  protected stepName = 'Configure Black Duck'
  protected stepIcon: IconName = 'BlackDuck'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Blackduck'
  protected stepPaletteVisible = false

  protected defaultValues: BlackduckStepData = {
    identifier: '',
    type: StepType.BlackDuck as string,
    spec: {
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'repository',
        name: '',
        variant: '',
        workspace: '/harness'
      },
      auth: {
        domain: '',
        type: API_KEY_AUTH_TYPE.value,
        access_id: '',
        access_token: '<+secrets.getValue("your_token_secret")>',
        version: API_VERSION_5_0_2.value,
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
  processFormData(data: BlackduckStepData): BlackduckStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<BlackduckStepData>): FormikErrors<BlackduckStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<BlackduckStepData>): JSX.Element {
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
        <BlackduckStepInputSet
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
        <BlackduckStepVariables
          {...(customStepProps as BlackduckStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <BlackduckStepBaseWithRef
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
