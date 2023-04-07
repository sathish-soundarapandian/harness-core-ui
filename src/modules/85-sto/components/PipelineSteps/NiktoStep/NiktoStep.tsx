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
import { NiktoStepBaseWithRef } from './NiktoStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { NiktoStepVariables, NiktoStepVariablesProps } from './NiktoStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './NiktoStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'
import { NIKTO_DEFAULT_CONFIG } from '../constants'

export type NiktoStepData = SecurityStepData<SecurityStepSpec>
export interface NiktoStepProps {
  initialValues: NiktoStepData
  template?: NiktoStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: NiktoStepData) => void
  onChange?: (data: NiktoStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class NiktoStep extends PipelineStep<NiktoStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Nikto
  protected stepName = 'Configure Nikto'
  protected stepIcon: IconName = 'nikto'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Nikto'
  protected stepPaletteVisible = false

  protected defaultValues: NiktoStepData = {
    identifier: '',
    type: 'StepType.Nikto' as string,
    spec: {
      mode: 'orchestration',
      config: NIKTO_DEFAULT_CONFIG.value,
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
        },
        args: {
          cli: ''
        }
      }
    }
  }

  /* istanbul ignore next */
  processFormData(data: NiktoStepData): NiktoStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<NiktoStepData>): FormikErrors<NiktoStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<NiktoStepData>): JSX.Element {
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
        <NiktoStepVariables
          {...(customStepProps as NiktoStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <NiktoStepBaseWithRef
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
