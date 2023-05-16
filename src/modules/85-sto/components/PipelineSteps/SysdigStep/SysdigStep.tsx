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
import { SysdigStepBaseWithRef } from './SysdigStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import type { SysdigStepVariablesProps } from './SysdigStepVariables';
import { SysdigStepVariables } from './SysdigStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SysdigStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type SysdigStepData = SecurityStepData<SecurityStepSpec>
export interface SysdigStepProps {
  initialValues: SysdigStepData
  template?: SysdigStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SysdigStepData) => void
  onChange?: (data: SysdigStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SysdigStep extends PipelineStep<SysdigStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Sysdig
  protected stepName = 'Configure Sysdig'
  protected stepIcon: IconName = 'sysdig'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Sysdig'
  protected stepPaletteVisible = false

  protected defaultValues: SysdigStepData = {
    identifier: '',
    type: StepType.Sysdig as string,
    spec: {
      privileged: true,
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'container',
        name: '',
        variant: '',
        workspace: ''
      },
      image: {
        type: 'docker_v2',
        name: '',
        domain: '',
        access_id: '',
        access_token: '',
        region: '',
        tag: ''
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
  processFormData(data: SysdigStepData): SysdigStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SysdigStepData>): FormikErrors<SysdigStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SysdigStepData>): JSX.Element {
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
        <SysdigStepVariables
          {...(customStepProps as SysdigStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SysdigStepBaseWithRef
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
