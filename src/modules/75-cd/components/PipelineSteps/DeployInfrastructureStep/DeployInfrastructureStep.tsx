/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'

import { getMultiTypeFromValue, IconName, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { DeploymentStageConfig } from 'services/cd-ng'

import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { DeployInfrastructureWidget } from './DeployInfrastructureWidget'
import DeployInfrastructureInputStep from './DeployInfrastructureInputStep'

export interface DeployInfrastructureStepConfig extends Omit<DeploymentStageConfig, 'execution'> {
  infrastructureRef?: string
}

export class DeployInfrastructureStep extends Step<DeployInfrastructureStepConfig> {
  lastFetched: number

  protected stepPaletteVisible = false
  protected type = StepType.DeployInfrastructure
  protected stepName = 'Deploy Infrastructure'
  protected stepIcon: IconName = 'main-environments'

  protected defaultValues: DeployInfrastructureStepConfig = {} as DeployInfrastructureStepConfig

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
  }

  private processInitialValues(initialValues: DeployInfrastructureStepConfig): DeployInfrastructureStepConfig {
    return {
      gitOpsEnabled: initialValues.gitOpsEnabled,
      ...(initialValues.gitOpsEnabled === false && {
        environment: {
          environmentRef: defaultTo(initialValues.environment?.environmentRef, ''),
          deployToAll: defaultTo(initialValues.environment?.deployToAll, false)
        },
        infrastructureRef: (initialValues.environment?.infrastructureDefinitions?.[0].ref ||
          initialValues.environment?.infrastructureDefinitions ||
          '') as string
      })
    }
  }

  private processFormData(data: DeployInfrastructureStepConfig): any {
    return {
      environment: {
        ...data.environment,
        infrastructureDefinitions:
          data.infrastructureRef === RUNTIME_INPUT_VALUE
            ? RUNTIME_INPUT_VALUE
            : [
                {
                  ref: data.infrastructureRef
                }
              ]
      }
    }
  }

  renderStep(props: StepProps<DeployInfrastructureStepConfig>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, readonly = false, allowableTypes } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DeployInfrastructureInputStep
          initialValues={initialValues}
          readonly={readonly}
          onUpdate={data => onUpdate?.(this.processFormData(data as any))}
          stepViewType={stepViewType}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData}
        />
      )
    }

    return (
      <DeployInfrastructureWidget
        initialValues={this.processInitialValues(initialValues)}
        readonly={readonly}
        onUpdate={data => onUpdate?.(this.processFormData(data as any))}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DeployInfrastructureStepConfig>): FormikErrors<DeployInfrastructureStepConfig> {
    const errors: FormikErrors<DeployInfrastructureStepConfig> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data?.environment?.environmentRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.environment?.environmentRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.environment = getString?.('cd.pipelineSteps.environmentTab.environmentIsRequired')
    }
    return errors
  }
}
