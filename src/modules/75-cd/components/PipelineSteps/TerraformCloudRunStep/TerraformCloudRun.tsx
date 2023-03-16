/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { IconName } from '@harness/uicore'
import type { StepElementConfig } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { TerraformCloudRunEditRef } from './TerraformCloudRunEdit'
import { processFormData, processInitialValues, getSanitizedflatObjectForVariablesView } from './helper'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import type { TerraformCloudRunData, TerraformCloudRunFormData, TerraformCloudRunVariablesViewProps } from './types'
import TerraformCloudRunInputStep from './TerraformCloudRunInputStep'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
export class TerraformCloudRun extends PipelineStep<any> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformCloudRun
  protected referenceId = 'terraformCloudRunStep'
  protected defaultValues: TerraformCloudRunData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerraformCloudRun,
    spec: {
      runType: '',
      runMessage: '',
      spec: {
        connectorRef: '',
        organization: '',
        workspace: ''
      }
    }
  }
  protected stepIcon: IconName = 'terraform-cloud-run'
  protected stepName = 'Terraform Cloud Run'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerraformCloudRun'

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    })

    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  /* istanbul ignore next */
  processFormData(data: TerraformCloudRunFormData): TerraformCloudRunData {
    return processFormData(data)
  }

  renderStep(props: StepProps<TerraformCloudRunData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <TerraformCloudRunInputStep
          initialValues={processInitialValues(initialValues)}
          stepViewType={stepViewType}
          readonly={readonly}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path}
          allowableTypes={allowableTypes}
          template={inputSetData?.template}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as TerraformCloudRunVariablesViewProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          metadataMap={metadataMap}
          data={getSanitizedflatObjectForVariablesView(variablesData)}
          originalData={initialValues as Record<string, any>}
        />
      )
    }
    return (
      <TerraformCloudRunEditRef
        initialValues={processInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformCloudRun}
      />
    )
  }
}
