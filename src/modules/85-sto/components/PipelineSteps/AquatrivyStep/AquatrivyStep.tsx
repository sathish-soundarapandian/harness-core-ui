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
import { AquatrivyStepBaseWithRef } from './AquatrivyStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { AquatrivyStepVariables, AquatrivyStepVariablesProps } from './AquatrivyStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './AquatrivyStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type AquatrivyStepData = SecurityStepData<SecurityStepSpec>
export interface AquatrivyStepProps {
  initialValues: AquatrivyStepData
  template?: AquatrivyStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: AquatrivyStepData) => void
  onChange?: (data: AquatrivyStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class AquatrivyStep extends PipelineStep<AquatrivyStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Aquatrivy
  protected stepName = 'Configure Aqua Trivy'
  protected stepIcon: IconName = 'AuqaTrivy'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.AquaTrivy'
  protected stepPaletteVisible = false

  protected defaultValues: AquatrivyStepData = {
    identifier: '',
    type: StepType.Aquatrivy as string,
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
  processFormData(data: AquatrivyStepData): AquatrivyStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AquatrivyStepData>): FormikErrors<AquatrivyStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<AquatrivyStepData>): JSX.Element {
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
        <AquatrivyStepVariables
          {...(customStepProps as AquatrivyStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <AquatrivyStepBaseWithRef
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
