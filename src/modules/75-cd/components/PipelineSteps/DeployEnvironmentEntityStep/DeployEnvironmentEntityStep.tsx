/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import type { IconName } from '@harness/uicore'

import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import DeployEnvironmentEntityWidget from './DeployEnvironmentEntityWidget'
import {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  processFormValues,
  processInitialValues
} from './utils'

export class DeployEnvironmentEntityStep extends Step<DeployEnvironmentEntityConfig> {
  protected type = StepType.DeployEnvironmentEntity
  protected stepPaletteVisible = false
  protected stepName = 'Deploy Environment Entity'
  protected stepIcon: IconName = 'main-environments'

  protected defaultValues: DeployEnvironmentEntityConfig = {}

  constructor() {
    super()
  }

  renderStep(props: StepProps<DeployEnvironmentEntityConfig>): JSX.Element {
    const { initialValues, readonly = false, allowableTypes, onUpdate, stepViewType, customStepProps } = props

    return (
      <DeployEnvironmentEntityWidget
        initialValues={processInitialValues(initialValues)}
        readonly={readonly}
        allowableTypes={allowableTypes}
        onUpdate={values => onUpdate?.(processFormValues(values, initialValues))}
        stepViewType={stepViewType}
        {...(customStepProps as DeployEnvironmentEntityCustomStepProps)}
      />
    )
  }

  validateInputSet(): any {
    // const errors: FormikErrors<DeployStageConfig> = {}
    // const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // data?.environment?.serviceOverrideInputs?.variables?.forEach((variable: AllNGVariables, index: number) => {
    //   const currentVariableTemplate = get(template, `environment.serviceOverrideInputs.variables[${index}].value`, '')
    //   if (
    //     isRequired &&
    //     ((isEmpty(variable.value) && variable.type !== 'Number') ||
    //       (variable.type === 'Number' && (typeof variable.value !== 'number' || isNaN(variable.value)))) &&
    //     getMultiTypeFromValue(currentVariableTemplate) === MultiTypeInputType.RUNTIME
    //   ) {
    //     set(
    //       errors,
    //       `serviceOverrideInputs.variables.[${index}].value`,
    //       getString?.('fieldRequired', { field: variable.name })
    //     )
    //   }
    // })
    // if (!(errors as unknown as DeployStageConfig['environment'])?.serviceOverrideInputs?.variables?.length) {
    //   delete (errors as unknown as DeployStageConfig['environment'])?.serviceOverrideInputs
    // }
    // data?.environment?.environmentInputs?.variables?.forEach((variable: AllNGVariables, index: number) => {
    //   const currentVariableTemplate = get(template, `environment.environmentInputs.variables[${index}].value`, '')
    //   if (
    //     isRequired &&
    //     ((isEmpty(variable.value) && variable.type !== 'Number') ||
    //       (variable.type === 'Number' && (typeof variable.value !== 'number' || isNaN(variable.value)))) &&
    //     getMultiTypeFromValue(currentVariableTemplate) === MultiTypeInputType.RUNTIME
    //   ) {
    //     set(
    //       errors,
    //       `environmentInputs.variables.[${index}].value`,
    //       getString?.('fieldRequired', { field: variable.name })
    //     )
    //   }
    // })
    // if (!(errors as unknown as DeployStageConfig['environment'])?.environmentInputs?.variables?.length) {
    //   delete (errors as unknown as DeployStageConfig['environment'])?.environmentInputs
    // }
    // return errors
  }
}
