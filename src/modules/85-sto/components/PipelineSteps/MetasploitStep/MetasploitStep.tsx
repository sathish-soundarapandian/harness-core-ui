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
import { MetasploitStepBaseWithRef } from './MetasploitStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { MetasploitStepVariables, MetasploitStepVariablesProps } from './MetasploitStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './MetasploitStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'
import { METASPLOIT_DEFAULT_CONFIG } from '../constants'

export type MetasploitStepData = SecurityStepData<SecurityStepSpec>
export interface MetasploitStepProps {
  initialValues: MetasploitStepData
  template?: MetasploitStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: MetasploitStepData) => void
  onChange?: (data: MetasploitStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class MetasploitStep extends PipelineStep<MetasploitStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Metasploit
  protected stepName = 'Configure Metasploit'
  protected stepIcon: IconName = 'metasploit'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Metasploit'
  protected stepPaletteVisible = false

  protected defaultValues: MetasploitStepData = {
    identifier: '',
    type: 'StepType.Metasploit' as string,
    spec: {
      mode: 'orchestration',
      config: METASPLOIT_DEFAULT_CONFIG.value,
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
  processFormData(data: MetasploitStepData): MetasploitStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<MetasploitStepData>): FormikErrors<MetasploitStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<MetasploitStepData>): JSX.Element {
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
        <MetasploitStepVariables
          {...(customStepProps as MetasploitStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <MetasploitStepBaseWithRef
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
