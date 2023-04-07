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
import { OWASPStepBaseWithRef } from './OWASPStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { OWASPStepVariables, OWASPStepVariablesProps } from './OWASPStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './OWASPStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type OWASPStepData = SecurityStepData<SecurityStepSpec>
export interface OWASPStepProps {
  initialValues: OWASPStepData
  template?: OWASPStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: OWASPStepData) => void
  onChange?: (data: OWASPStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class OWASPStep extends PipelineStep<OWASPStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.OWASP
  protected stepName = 'Configure OWASP Dependency Check'
  protected stepIcon: IconName = 'owasp'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.OWASP'
  protected stepPaletteVisible = false

  protected defaultValues: OWASPStepData = {
    identifier: '',
    type: StepType.OWASP as string,
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
  processFormData(data: OWASPStepData): OWASPStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<OWASPStepData>): FormikErrors<OWASPStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<OWASPStepData>): JSX.Element {
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
        <OWASPStepVariables
          {...(customStepProps as OWASPStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <OWASPStepBaseWithRef
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
