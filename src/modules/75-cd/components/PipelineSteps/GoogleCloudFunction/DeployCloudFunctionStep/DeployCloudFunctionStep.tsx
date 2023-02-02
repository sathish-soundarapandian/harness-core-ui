/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { get, isEmpty, set } from 'lodash-es'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { CloudFunctionExecutionStepInitialValues } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { NoTrafficShiftExecutionStepEditRef } from '../NoTrafficShiftExecutionStepEdit'
import { NoTrafficShiftExecutionStepInputSet } from '../NoTrafficShiftExecutionStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface DeployCloudFunctionVariableStepProps {
  initialValues: CloudFunctionExecutionStepInitialValues
  stageIdentifier: string
  onUpdate?(data: CloudFunctionExecutionStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: CloudFunctionExecutionStepInitialValues
}

export class DeployCloudFunctionStep extends PipelineStep<CloudFunctionExecutionStepInitialValues> {
  protected type = StepType.DeployCloudFunction
  protected stepName = 'Deploy Cloud Function'
  protected stepIcon: IconName = 'deploy-cloud-function'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.DeployCloudFunction'
  protected isHarnessSpecific = false
  protected defaultValues: CloudFunctionExecutionStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.DeployCloudFunction,
    timeout: '10m',
    spec: {
      updateFieldMask: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<CloudFunctionExecutionStepInitialValues>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <NoTrafficShiftExecutionStepInputSet
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<CloudFunctionExecutionStepInitialValues>}
          stepViewType={stepViewType}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as DeployCloudFunctionVariableStepProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <NoTrafficShiftExecutionStepEditRef
        formikFormName={'deployCloudFunctionStepEdit'}
        initialValues={initialValues as CloudFunctionExecutionStepInitialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CloudFunctionExecutionStepInitialValues>): FormikErrors<CloudFunctionExecutionStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<CloudFunctionExecutionStepInitialValues>

    if (
      isEmpty(get(data, `spec.updateFieldMask`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `spec.updateFieldMask`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `spec.updateFieldMask`,
        getString?.('fieldRequired', { field: getString('cd.steps.googleCloudFunctionCommon.fieldMask') })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
