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
import { PrismaCloudStepBaseWithRef } from './PrismaCloudStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { PrismaCloudStepVariables, PrismaCloudStepVariablesProps } from './PrismaCloudStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './PrismaCloudStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type PrismaCloudStepData = SecurityStepData<SecurityStepSpec>
export interface PrismaCloudStepProps {
  initialValues: PrismaCloudStepData
  template?: PrismaCloudStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: PrismaCloudStepData) => void
  onChange?: (data: PrismaCloudStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class PrismaCloudStep extends PipelineStep<PrismaCloudStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.PrismaCloud
  protected stepName = 'Configure Prisma Cloud'
  protected stepIcon: IconName = 'PrismaCloud'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.PrismaCloud'
  protected stepPaletteVisible = false

  protected defaultValues: PrismaCloudStepData = {
    identifier: '',
    type: StepType.PrismaCloud as string,
    spec: {
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
        domain: '',
        access_token: '',
        name: '',
        tag: ''
      },
      tool: {
        image_name: ''
      },
      auth: {
        domain: '',
        access_id: '',
        access_token: ''
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
  processFormData(data: PrismaCloudStepData): PrismaCloudStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<PrismaCloudStepData>): FormikErrors<PrismaCloudStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<PrismaCloudStepData>): JSX.Element {
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
        <PrismaCloudStepVariables
          {...(customStepProps as PrismaCloudStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <PrismaCloudStepBaseWithRef
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
