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
import { SnykStepBaseWithRef } from './SnykStepBase'
import { SnykStepInputSet } from './SnykStepInputSet'
import { SnykStepVariables, SnykStepVariablesProps } from './SnykStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SnykStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type SnykStepData = SecurityStepData<SecurityStepSpec>
export interface SnykStepProps {
  initialValues: SnykStepData
  template?: SnykStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SnykStepData) => void
  onChange?: (data: SnykStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SnykStep extends PipelineStep<SnykStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Snyk
  protected stepName = 'Configure Snyk'
  protected stepIcon: IconName = 'Snyk'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Snyk'
  protected stepPaletteVisible = false

  protected defaultValues: SnykStepData = {
    identifier: '',
    type: StepType.Snyk as string,
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
        access_token: '<+secrets.getValue("your_snyk_token_secret")>'
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
  processFormData(data: SnykStepData): SnykStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SnykStepData>): FormikErrors<SnykStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<SnykStepData>): JSX.Element {
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
        <SnykStepInputSet
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
        <SnykStepVariables
          {...(customStepProps as SnykStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SnykStepBaseWithRef
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
