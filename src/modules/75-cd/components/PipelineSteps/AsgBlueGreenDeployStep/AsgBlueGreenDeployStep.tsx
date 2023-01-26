/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty, set } from 'lodash-es'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StageElementWrapper, DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import { AsgBlueGreenDeployStepEditRef } from './AsgBlueGreenDeployStepEdit'
import { AsgBlueGreenDeployStepInputSetMode } from './AsgBlueGreenDeployStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AsgBlueGreenDeployStepInitialValues extends StepElementConfig {
  spec: {
    loadBalancer: string
    prodListener: string
    prodListenerRuleArn: string
    stageListener: string
    stageListenerRuleArn: string
  }
}
export interface AsgBlueGreenDeployCustomStepProps {
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgBlueGreenDeployStepInitialValues
  selectedStage: StageElementWrapper<DeploymentStageElementConfig>
  stageIdentifier: string
}

export class AsgBlueGreenDeployStep extends PipelineStep<AsgBlueGreenDeployStepInitialValues> {
  protected type = StepType.AsgBlueGreenDeploy
  protected stepName = 'ASG Blue Green Deploy Step'
  protected stepIcon: IconName = 'asg-blue-green'
  protected stepDescription: keyof StringsMap = 'cd.asgBlueGreenDeployStepDescription'
  protected isHarnessSpecific = false
  protected defaultValues: AsgBlueGreenDeployStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.AsgBlueGreenDeploy,
    timeout: '10m',
    spec: {
      loadBalancer: '',
      prodListener: '',
      prodListenerRuleArn: '',
      stageListener: '',
      stageListenerRuleArn: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<AsgBlueGreenDeployStepInitialValues>): JSX.Element {
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
        <AsgBlueGreenDeployStepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<AsgBlueGreenDeployStepInitialValues>}
          customStepProps={customStepProps as AsgBlueGreenDeployCustomStepProps}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AsgBlueGreenDeployCustomStepProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <AsgBlueGreenDeployStepEditRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        customStepProps={customStepProps as AsgBlueGreenDeployCustomStepProps}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AsgBlueGreenDeployStepInitialValues>): FormikErrors<AsgBlueGreenDeployStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const errors: FormikErrors<AsgBlueGreenDeployStepInitialValues> = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<AsgBlueGreenDeployStepInitialValues>

    if (
      isRequired &&
      getMultiTypeFromValue(template?.spec?.loadBalancer) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.loadBalancer)
    ) {
      set(
        errors,
        'spec.loadBalancer',
        getString?.('common.validation.fieldIsRequired', {
          name: getString('common.loadBalancer')
        })
      )
    }

    if (
      isRequired &&
      getMultiTypeFromValue(template?.spec?.prodListener) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.prodListener)
    ) {
      set(
        errors,
        'spec.prodListener',
        getString?.('common.validation.fieldIsRequired', {
          name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')
        })
      )
    }

    if (
      isRequired &&
      getMultiTypeFromValue(template?.spec?.stageListener) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.stageListener)
    ) {
      set(
        errors,
        'spec.stageListener',
        getString?.('common.validation.fieldIsRequired', {
          name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')
        })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
