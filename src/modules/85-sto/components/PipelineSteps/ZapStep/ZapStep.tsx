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
import { ZapStepBaseWithRef } from './ZapStepBase'
import { ZapStepInputSet } from './ZapStepInputSet'
import { ZapStepVariables, ZapStepVariablesProps } from './ZapStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './ZapStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type ZapStepData = SecurityStepData<SecurityStepSpec>
export interface ZapStepProps {
  initialValues: ZapStepData
  template?: ZapStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: ZapStepData) => void
  onChange?: (data: ZapStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class ZapStep extends PipelineStep<ZapStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Zap
  protected stepName = 'Configure Zap'
  protected stepIcon: IconName = 'ZAP'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Zap'
  protected stepPaletteVisible = false

  protected defaultValues: ZapStepData = {
    identifier: '',
    type: 'StepType.Zap' as string,
    spec: {
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'instance',
        name: '',
        variant: '',
        workspace: '/harness'
      },
      tool: {
        port: 8981
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
  processFormData(data: ZapStepData): ZapStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ZapStepData>): FormikErrors<ZapStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<ZapStepData>): JSX.Element {
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
        <ZapStepInputSet
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
        <ZapStepVariables
          {...(customStepProps as ZapStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ZapStepBaseWithRef
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
