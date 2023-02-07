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
import type { CloudFunctionTrafficShiftExecutionStepInitialValues } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { TrafficShiftExecutionStepEditRef } from '../TrafficShiftExecutionStepEdit'
import { GenericExecutionStepInputSet } from '../../Common/GenericExecutionStep/GenericExecutionStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface DeployCloudFunctionTrafficShiftVariableStepProps {
  initialValues: CloudFunctionTrafficShiftExecutionStepInitialValues
  stageIdentifier: string
  onUpdate?(data: CloudFunctionTrafficShiftExecutionStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: CloudFunctionTrafficShiftExecutionStepInitialValues
}

export class DeployCloudFunctionTrafficShiftStep extends PipelineStep<CloudFunctionTrafficShiftExecutionStepInitialValues> {
  protected type = StepType.CloudFunctionTrafficShift
  protected stepName = 'Cloud Function Traffic Shift'
  protected stepIcon: IconName = 'cloud-function-traffic-shift'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.DeployCloudFunctionTrafficShift'
  protected isHarnessSpecific = false
  protected defaultValues: CloudFunctionTrafficShiftExecutionStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.CloudFunctionTrafficShift,
    timeout: '10m',
    spec: {
      trafficPercent: 0
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<CloudFunctionTrafficShiftExecutionStepInitialValues>): JSX.Element {
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
        <GenericExecutionStepInputSet
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<CloudFunctionTrafficShiftExecutionStepInitialValues>}
          stepViewType={stepViewType}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as DeployCloudFunctionTrafficShiftVariableStepProps
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
      <TrafficShiftExecutionStepEditRef
        formikFormName={'cloudFunctionTrafficShiftStep'}
        initialValues={initialValues as CloudFunctionTrafficShiftExecutionStepInitialValues}
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
  }: ValidateInputSetProps<CloudFunctionTrafficShiftExecutionStepInitialValues>): FormikErrors<CloudFunctionTrafficShiftExecutionStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<CloudFunctionTrafficShiftExecutionStepInitialValues>

    if (
      isEmpty(get(data, `spec.trafficPercent`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `spec.trafficPercent`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `spec.trafficPercent`,
        getString?.('fieldRequired', { field: getString('cd.steps.googleCloudFunctionCommon.trafficPercent') })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
