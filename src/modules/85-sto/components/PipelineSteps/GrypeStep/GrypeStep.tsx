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
import { GrypeStepBaseWithRef } from './GrypeStepBase'
import { GrypeStepInputSet } from './GrypeStepInputSet'
import { GrypeStepVariables, GrypeStepVariablesProps } from './GrypeStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GrypeStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type GrypeStepData = SecurityStepData<SecurityStepSpec>
export interface GrypeStepProps {
  initialValues: GrypeStepData
  template?: GrypeStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: GrypeStepData) => void
  onChange?: (data: GrypeStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class GrypeStep extends PipelineStep<GrypeStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Grype
  protected stepName = 'Configure Anchore Grype'
  protected stepIcon: IconName = 'Anchore'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Grype'
  protected stepPaletteVisible = false

  protected defaultValues: GrypeStepData = {
    identifier: '',
    type: StepType.Grype as string,
    spec: {
      privileged: true,
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'repository',
        name: '',
        variant: '',
        workspace: '/harness'
      },
      image: {
        type: 'docker_v2',
        name: '',
        domain: '',
        access_id: '',
        access_token: '<+secrets.getValue("your_garype_token_secret")>',
        region: ''
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
  processFormData(data: GrypeStepData): GrypeStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<GrypeStepData>): FormikErrors<GrypeStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<GrypeStepData>): JSX.Element {
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
        <GrypeStepInputSet
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
        <GrypeStepVariables
          {...(customStepProps as GrypeStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GrypeStepBaseWithRef
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
