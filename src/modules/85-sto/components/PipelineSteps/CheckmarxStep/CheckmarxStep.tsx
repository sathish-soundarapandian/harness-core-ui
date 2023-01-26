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
import { CheckmarxStepBaseWithRef } from './CheckmarxStepBase'
import { CheckmarxStepInputSet } from './CheckmarxStepInputSet'
import { CheckmarxStepVariables, CheckmarxStepVariablesProps } from './CheckmarxStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './CheckmarxStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type CheckmarxStepData = SecurityStepData<SecurityStepSpec>
export interface CheckmarxStepProps {
  initialValues: CheckmarxStepData
  template?: CheckmarxStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: CheckmarxStepData) => void
  onChange?: (data: CheckmarxStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class CheckmarxStep extends PipelineStep<CheckmarxStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Checkmarx
  protected stepName = 'Configure Checkmarx'
  protected stepIcon: IconName = 'Checkmarx'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Checkmarx'
  protected stepPaletteVisible = false

  protected defaultValues: CheckmarxStepData = {
    identifier: '',
    type: StepType.Checkmarx as string,
    spec: {
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'repository',
        name: '',
        variant: '',
        workspace: ''
      },
      auth: {
        domain: '',
        access_id: '',
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
  processFormData(data: CheckmarxStepData): CheckmarxStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CheckmarxStepData>): FormikErrors<CheckmarxStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }
    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<CheckmarxStepData>): JSX.Element {
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
        <CheckmarxStepInputSet
          initialValues={initialValues}
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
        <CheckmarxStepVariables
          {...(customStepProps as CheckmarxStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <CheckmarxStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        /* istanbul ignore next */
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
