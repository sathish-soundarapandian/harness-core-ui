/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import { Color } from '@harness/design-system'
import type { AllowedTypes } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import React from 'react'
import { defaultTo } from 'lodash-es'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { StringsMap } from 'stringTypes'
import { VariableListTableProps, VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { SbomOrchestrationTool, SbomSource, SyftSbomOrchestration } from 'services/ci'
import { SscaOrchestrationStepEditWithRef } from './SscaOrchestrationStepEdit'
import {
  getInputSetViewValidateFieldsConfig,
  transformValuesFieldsConfig
} from './SscaOrchestrationStepFunctionConfigs'
import SscaOrchestrationStepInputSet from './SscaOrchestrationStepInputSet'
import { commonDefaultOrchestrationSpecValues } from '../utils'

export interface SscaOrchestrationStepSpec {
  tool: {
    type: SbomOrchestrationTool['type']
    spec: {
      format: SyftSbomOrchestration['format']
    }
  }
  source: {
    type: SbomSource['type']
    spec: {
      connector: string
      image: string
    }
  }
  attestation: {
    type: 'cosign' //TODO: update once BE changes are available in type definition
    spec: {
      privateKey: string
      password: string
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

export interface SscaOrchestrationStepData {
  name?: string
  identifier: string
  type: string
  spec: SscaOrchestrationStepSpec
  timeout?: string
}
export type SscaOrchestrationStepDataUI = SscaOrchestrationStepSpec

export interface SscaOrchestrationStepProps {
  initialValues: SscaOrchestrationStepData
  template?: SscaOrchestrationStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SscaOrchestrationStepData) => void
  onChange?: (data: SscaOrchestrationStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
  stepType: StepType
}

export class SscaOrchestrationStep extends PipelineStep<SscaOrchestrationStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
  }

  protected type = StepType.SscaOrchestration
  protected stepName = 'SSCA Orchestration'
  protected stepIcon: IconName = 'ssca-orchestrate'
  protected stepIconColor = Color.GREY_600
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SscaOrchestration'
  protected stepPaletteVisible = false
  protected defaultValues: SscaOrchestrationStepData = {
    type: StepType.SscaOrchestration,
    identifier: '',
    spec: commonDefaultOrchestrationSpecValues
  }

  processFormData<T>(data: T): SscaOrchestrationStepData {
    return getFormValuesInCorrectFormat<T, SscaOrchestrationStepData>(data, transformValuesFieldsConfig(this?.type))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SscaOrchestrationStepData>): FormikErrors<SscaOrchestrationStepData> {
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

    return {}
  }

  renderStep(props: StepProps<SscaOrchestrationStepData>): JSX.Element {
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
        <SscaOrchestrationStepInputSet
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
      <SscaOrchestrationStepEditWithRef
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
