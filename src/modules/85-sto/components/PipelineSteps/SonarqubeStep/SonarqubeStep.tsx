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
import { SonarqubeStepBaseWithRef } from './SonarqubeStepBase'
import { SonarqubeStepInputSet } from './SonarqubeStepInputSet'
import { SonarqubeStepVariables, SonarqubeStepVariablesProps } from './SonarqubeStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SonarqubeStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type SonarqubeStepData = SecurityStepData<SecurityStepSpec>
export interface SonarqubeStepProps {
  initialValues: SonarqubeStepData
  template?: SonarqubeStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SonarqubeStepData) => void
  onChange?: (data: SonarqubeStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SonarqubeStep extends PipelineStep<SonarqubeStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Sonarqube
  protected stepName = 'Configure Sonarqube'
  protected stepIcon: IconName = 'SonarQube'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Sonarqube'
  protected stepPaletteVisible = false

  protected defaultValues: SonarqubeStepData = {
    identifier: '',
    type: StepType.Sonarqube as string,
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
        access_token: '<+secrets.getValue("your_sonarqube_token_secret")>',
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
  processFormData(data: SonarqubeStepData): SonarqubeStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SonarqubeStepData>): FormikErrors<SonarqubeStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SonarqubeStepData>): JSX.Element {
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
        <SonarqubeStepInputSet
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
        <SonarqubeStepVariables
          {...(customStepProps as SonarqubeStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SonarqubeStepBaseWithRef
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
