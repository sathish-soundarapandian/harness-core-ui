/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import type { IconName } from '@harness/icons'
import type { AllowedTypes } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import { defaultTo } from 'lodash-es'
import React from 'react'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { flatObject } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { VariableListTableProps, VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SbomSource } from 'services/ci'
import type { StringsMap } from 'stringTypes'
import { SscaEnforcementStepEditWithRef } from './SscaEnforcementStepEdit'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SscaEnforcementStepFunctionConfigs'
import SscaEnforcementStepInputSet from './SscaEnforcementStepInputSet'
import { commonDefaultEnforcementSpecValues } from '../utils'

export interface SscaEnforcementStepSpec {
  source: {
    type: SbomSource['type']
    spec: {
      connector: string
      image: string
    }
  }
  verifyAttestation: {
    type: 'cosign' //TODO: update once BE changes are available in type definition
    spec: {
      publicKey: string
    }
  }
  policy: {
    store: {
      type: 'Harness'
      spec: {
        file: string
      }
    }
  }
  infrastructure?: {
    type: string
    spec: {
      connectorRef: string
      namespace: string
      resources: {
        limits: {
          memory?: string
          cpu?: string
        }
      }
    }
  }
}

export interface SscaEnforcementStepData {
  name?: string
  identifier: string
  type: string
  spec: SscaEnforcementStepSpec
  timeout?: string
}
export type SscaEnforcementStepDataUI = SscaEnforcementStepSpec

export interface SscaEnforcementStepProps {
  initialValues: SscaEnforcementStepData
  template?: SscaEnforcementStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SscaEnforcementStepData) => void
  onChange?: (data: SscaEnforcementStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
  stepType: StepType
}

export class SscaEnforcementStep extends PipelineStep<SscaEnforcementStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
  }

  protected type = StepType.SscaEnforcement
  protected stepName = 'Ssca Enforcement'
  protected stepIcon: IconName = 'ssca-enforce'
  protected stepIconColor = Color.GREY_600
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SscaEnforcement'
  protected stepPaletteVisible = false
  protected defaultValues: SscaEnforcementStepData = {
    type: StepType.SscaEnforcement,
    identifier: '',
    spec: commonDefaultEnforcementSpecValues
  }

  processFormData<T>(data: T): SscaEnforcementStepData {
    return getFormValuesInCorrectFormat<T, SscaEnforcementStepData>(data, transformValuesFieldsConfig(this?.type))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SscaEnforcementStepData>): FormikErrors<SscaEnforcementStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(
        data,
        template,
        getInputSetViewValidateFieldsConfig(this.type)(isRequired),
        { getString },
        viewType
      )
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<SscaEnforcementStepData>): JSX.Element {
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
        <SscaEnforcementStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
          stepType={this.type}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={flatObject(defaultTo(initialValues, {}))}
          originalData={initialValues}
          metadataMap={(customStepProps as Pick<VariableListTableProps, 'metadataMap'>)?.metadataMap}
        />
      )
    }

    return (
      <SscaEnforcementStepEditWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
        stepType={this.type}
      />
    )
  }
}
