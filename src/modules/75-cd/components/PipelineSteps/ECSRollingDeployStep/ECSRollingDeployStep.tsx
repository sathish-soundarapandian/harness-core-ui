/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import type { IconName } from '@harness/uicore'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { ECSRollingDeployStepElementConfig } from '@pipeline/utils/types'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import { ECSRollingDeployStepEditRef } from './ECSRollingDeployStepEdit'
import { ECSRollingDeployStepInputSetMode } from './ECSRollingDeployStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface ECSRollingDeployVariableStepProps {
  initialValues: ECSRollingDeployStepElementConfig
  stageIdentifier: string
  onUpdate?(data: ECSRollingDeployStepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ECSRollingDeployStepElementConfig
}

export class ECSRollingDeployStep extends PipelineStep<ECSRollingDeployStepElementConfig> {
  protected type = StepType.EcsRollingDeploy
  protected stepName = 'ECS Rolling Deploy'
  protected stepIcon: IconName = 'rolling'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ECSRollingDeploy'
  protected isHarnessSpecific = false
  protected defaultValues: ECSRollingDeployStepElementConfig = {
    identifier: '',
    name: '',
    type: StepType.EcsRollingDeploy,
    timeout: '10m',
    spec: {
      sameAsAlreadyRunningInstances: false,
      forceNewDeployment: false
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<ECSRollingDeployStepElementConfig>): JSX.Element {
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
        <ECSRollingDeployStepInputSetMode
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ECSRollingDeployStepElementConfig>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ECSRollingDeployVariableStepProps
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
      <ECSRollingDeployStepEditRef
        initialValues={initialValues}
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
  }: ValidateInputSetProps<ECSRollingDeployStepElementConfig>): FormikErrors<ECSRollingDeployStepElementConfig> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ECSRollingDeployStepElementConfig>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
