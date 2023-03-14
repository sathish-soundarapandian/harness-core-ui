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
import { CustomIngestionStepBaseWithRef } from './CustomIngestionStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { CustomIngestionStepVariables, CustomIngestionStepVariablesProps } from './CustomIngestionStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './CustomIngestionStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type CustomIngestionStepData = SecurityStepData<SecurityStepSpec>
export interface CustomIngestionStepProps {
  initialValues: CustomIngestionStepData
  template?: CustomIngestionStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: CustomIngestionStepData) => void
  onChange?: (data: CustomIngestionStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class CustomIngestionStep extends PipelineStep<CustomIngestionStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.CustomIngestion
  protected stepName = 'Configure CustomIngestion'
  protected stepIcon: IconName = 'upload-box'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.CustomIngestion'
  protected stepPaletteVisible = false

  protected defaultValues: CustomIngestionStepData = {
    identifier: '',
    type: StepType.CustomIngestion as string,
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
  processFormData(data: CustomIngestionStepData): CustomIngestionStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CustomIngestionStepData>): FormikErrors<CustomIngestionStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<CustomIngestionStepData>): JSX.Element {
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
        <CustomIngestionStepVariables
          {...(customStepProps as CustomIngestionStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <CustomIngestionStepBaseWithRef
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
