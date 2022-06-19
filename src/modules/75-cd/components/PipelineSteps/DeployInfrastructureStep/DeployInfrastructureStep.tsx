/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'

import { getMultiTypeFromValue, IconName, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type { DeploymentStageConfig } from 'services/cd-ng'

import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { DeployInfrastructureWidget } from './DeployInfrastructureWidget'
import DeployInfrastructureInputStep from './DeployInfrastructureInputStep'

export interface DeployInfrastructureStepConfig extends Omit<DeploymentStageConfig, 'execution'> {
  infrastructureRef?: string
  environmentOrEnvGroupRef?: SelectOption | string
  environmentInEnvGroupRef?: SelectOption | string
  clusterRef?: SelectOption[] | string
  isEnvGroup?: boolean
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
    const gitOpsEnabled = initialValues.gitOpsEnabled
    const isEnvGroup = Boolean(initialValues.environmentGroup)
    return {
      gitOpsEnabled,
      ...(gitOpsEnabled === false && {
        environment: {
          environmentRef: defaultTo(initialValues.environment?.environmentRef, ''),
          deployToAll: defaultTo(initialValues.environment?.deployToAll, false)
        },
        infrastructureRef: (initialValues.environment?.infrastructureDefinitions?.[0].ref ||
          initialValues.environment?.infrastructureDefinitions ||
          '') as string
      }),
      ...(gitOpsEnabled === true && {
        ...(!isEnvGroup && {
          isEnvGroup,
          environmentOrEnvGroupRef: defaultTo(initialValues.environment?.environmentRef, ''),
          deployToAll: defaultTo(initialValues.environment?.deployToAll, false),
          clusterRef:
            getMultiTypeFromValue(initialValues.environment?.gitOpsClusters as any) === MultiTypeInputType.RUNTIME
              ? RUNTIME_INPUT_VALUE
              : initialValues.environment?.gitOpsClusters?.map(cluster => {
                  return {
                    label: cluster.ref,
                    value: cluster.ref
                  }
                })
        }),
        ...(isEnvGroup && {
          isEnvGroup,
          environmentOrEnvGroupRef: defaultTo(initialValues.environmentGroup?.envGroupRef, ''),
          environmentInEnvGroupRef:
            typeof initialValues.environmentGroup?.envGroupConfig === 'string'
              ? RUNTIME_INPUT_VALUE
              : defaultTo(initialValues.environmentGroup?.envGroupConfig?.[0].environmentRef, ''),
          deployToAll: defaultTo(initialValues.environment?.deployToAll, false),
          clusterRef:
            typeof initialValues.environmentGroup?.envGroupConfig?.[0]?.gitOpsClusters === 'string'
              ? RUNTIME_INPUT_VALUE
              : initialValues.environmentGroup?.envGroupConfig?.[0]?.gitOpsClusters?.map(cluster => {
                  return {
                    label: cluster.ref,
                    value: cluster.ref
                  }
                })
        })
      })
    }
  }

  private processFormData(data: DeployInfrastructureStepConfig): any {
    const gitOpsEnabled = data.gitOpsEnabled
    const isEnvGroup = data.isEnvGroup

    return {
      ...(gitOpsEnabled === false && {
        environment: {
          environmentRef:
            data.environment?.environmentRef === RUNTIME_INPUT_VALUE
              ? RUNTIME_INPUT_VALUE
              : data.environment?.environmentRef,
          deployToAll: defaultTo(data.environment?.deployToAll, false),
          ...(data.infrastructureRef && {
            infrastructureDefinitions:
              data.infrastructureRef === RUNTIME_INPUT_VALUE
                ? RUNTIME_INPUT_VALUE
                : [
                    {
                      ref: data.infrastructureRef
                    }
                  ]
          })
        }
      }),
      ...(gitOpsEnabled === true && {
        ...(!isEnvGroup &&
          data.environmentOrEnvGroupRef !== RUNTIME_INPUT_VALUE && {
            environment: {
              environmentRef:
                data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE
                  ? RUNTIME_INPUT_VALUE
                  : defaultTo((data.environmentOrEnvGroupRef as SelectOption)?.value, ''),
              deployToAll: defaultTo(data.environment?.deployToAll, false),
              gitOpsClusters:
                data.clusterRef === RUNTIME_INPUT_VALUE
                  ? RUNTIME_INPUT_VALUE
                  : (data.clusterRef as SelectOption[])?.map(cluster => ({ ref: cluster.value }))
            }
          }),
        ...((isEnvGroup || data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE) && {
          environmentGroup: {
            envGroupRef:
              data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE
                ? RUNTIME_INPUT_VALUE
                : defaultTo((data.environmentOrEnvGroupRef as SelectOption)?.value, ''),
            envGroupConfig:
              data.environmentInEnvGroupRef === RUNTIME_INPUT_VALUE
                ? RUNTIME_INPUT_VALUE
                : [
                    {
                      environmentRef: (data.environmentInEnvGroupRef as SelectOption)?.value,
                      deployToAll: defaultTo(data.environment?.deployToAll, false),
                      gitOpsClusters:
                        data.clusterRef === RUNTIME_INPUT_VALUE
                          ? RUNTIME_INPUT_VALUE
                          : (data.clusterRef as SelectOption[])?.map(cluster => ({ ref: cluster.value }))
                    }
                  ]
          }
        })
      })
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
