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
import { FossaStepBaseWithRef } from './FossaStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { FossaStepVariables, FossaStepVariablesProps } from './FossaStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './FossaStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type FossaStepData = SecurityStepData<SecurityStepSpec>
export interface FossaStepProps {
  initialValues: FossaStepData
  template?: FossaStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: FossaStepData) => void
  onChange?: (data: FossaStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class FossaStep extends PipelineStep<FossaStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Fossa
  protected stepName = 'Configure Fossa'
  protected stepIcon: IconName = 'fossa'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Fossa'
  protected stepPaletteVisible = true

  protected defaultValues: FossaStepData = {
    identifier: '',
    type: StepType.Fossa as string,
    spec: {
      mode: 'ingestion',
      config: 'default',
      target: {
        type: 'repository',
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
  processFormData(data: FossaStepData): FossaStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<FossaStepData>): FormikErrors<FossaStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<FossaStepData>): JSX.Element {
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
        <FossaStepVariables
          {...(customStepProps as FossaStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <FossaStepBaseWithRef
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
