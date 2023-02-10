/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { IconName } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { StepElementConfig } from 'services/cd-ng'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import GitOpsFetchLinkedAppsWidget from './GitOpsFetchLinkedAppsWidget'
import GitOpsFetchLinkedAppsInputStep from './GitOpsFetchLinkedAppsInputStep'
import { validateGitOpsExecutionStepForm } from '../PipelineSteps/PipelineStepsUtil'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

const GitOpsFetchLinkedAppsWidgetWithRef = React.forwardRef(GitOpsFetchLinkedAppsWidget)
export class GitOpsFetchLinkedApps extends PipelineStep<StepElementConfig> {
  constructor() {
    super()
    // this._hasStepVariables = false
    this._hasDelegateSelectionVisible = true
  }
  renderStep(
    props: StepProps<StepElementConfig, { variablesData: any; metadataMap: Record<string, VariableResponseMapValue> }>
  ): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      isNewStep,
      readonly,
      onChange,
      allowableTypes,
      customStepProps
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      // Input Step View - Run time form
      return (
        <GitOpsFetchLinkedAppsInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      // Variable Step
      const variablesData = /* istanbul ignore next */ customStepProps?.variablesData
      const metadataMap = /* istanbul ignore next */ customStepProps?.metadataMap as Record<
        string,
        VariableResponseMapValue
      >
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          metadataMap={metadataMap}
          data={variablesData.spec}
          originalData={/* istanbul ignore next */ initialValues?.spec}
        />
      )
    }
    return (
      <GitOpsFetchLinkedAppsWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType || StepViewType.Edit}
        ref={formikRef}
        readonly={readonly}
        onChange={onChange}
        allowableTypes={allowableTypes}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> {
    return validateGitOpsExecutionStepForm({ data, template, getString, viewType })
  }

  processFormData(values: StepElementConfig): StepElementConfig {
    return values
  }

  protected type = StepType.GitOpsFetchLinkedApps
  protected stepName = 'Fetch Linked Apps'
  protected stepIcon: IconName = 'gitops-application'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.fetchLinkedApps'

  protected defaultValues: StepElementConfig = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.GitOpsFetchLinkedApps
  }
}
