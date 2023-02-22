/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty, isNil, merge } from 'lodash-es'

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { EnvironmentYamlV2 } from 'services/cd-ng'

import { isValueRuntimeInput } from '@common/utils/utils'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'

import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import type { EnvironmentData } from './types'

export const createEnvTemplate = (
  existingTemplate: EnvironmentYamlV2[],
  environmentIdentifiers: string[],
  environmentsData: EnvironmentData[],
  childEntity: 'gitOpsClusters' | 'infrastructureDefinitions',
  serviceIdentifiers: string[]
): EnvironmentYamlV2[] => {
  return environmentIdentifiers.map(envId => {
    const existingTemplateOfEnvironment = Array.isArray(existingTemplate)
      ? existingTemplate.find(envTemplate => (envTemplate as any).envIdForTemplate === envId)
      : undefined

    const templateFromEnvironmentData = environmentsData.find(
      envTemplate => getScopedValueFromDTO(envTemplate.environment) === envId
    )

    const newEnvironmentInputsTemplate = defaultTo(
      existingTemplateOfEnvironment?.environmentInputs,
      templateFromEnvironmentData?.environmentInputs
    )

    const newServiceOverridesInputsTemplate = defaultTo(
      existingTemplateOfEnvironment?.serviceOverrideInputs,
      !isEmpty(templateFromEnvironmentData?.serviceOverrideInputs?.[envId])
        ? templateFromEnvironmentData?.serviceOverrideInputs?.[envId]?.[serviceIdentifiers[0]]
        : undefined
    )

    const newChildEntityTemplate =
      existingTemplateOfEnvironment?.[childEntity] && Array.isArray(existingTemplateOfEnvironment?.[childEntity])
        ? existingTemplateOfEnvironment[childEntity]
        : (RUNTIME_INPUT_VALUE as any)

    return {
      // This is to differentiate the object when the environment has changed
      envIdForTemplate: envId,
      environmentRef: RUNTIME_INPUT_VALUE,
      environmentInputs: newEnvironmentInputsTemplate,
      serviceOverrideInputs: newServiceOverridesInputsTemplate,
      deployToAll: RUNTIME_INPUT_VALUE as any,
      [childEntity]: newChildEntityTemplate
    }
  })
}

export const createEnvValues = (
  existingEnvironmentValues: EnvironmentYamlV2[],
  environmentIdentifiers: string[],
  environmentsData: EnvironmentData[],
  deployToAllEnvironments: boolean,
  childEntity: 'gitOpsClusters' | 'infrastructureDefinitions',
  serviceIdentifiers: string[],
  isMultiEnvironment: boolean,
  stepViewType?: StepViewType
): EnvironmentYamlV2[] => {
  return environmentIdentifiers.map(environmentIdentifier => {
    const valueFromEnvironmentsData = environmentsData.find(
      envValue => getScopedValueFromDTO(envValue.environment) === environmentIdentifier
    )

    // Start - Retain form values

    const existingValueOfEnvironment = Array.isArray(existingEnvironmentValues)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        existingEnvironmentValues.find(
          envValue =>
            // envIdForValues is required only in the case of single environment to identify changes in runtime inputs.
            // This is because the object as a whole does not have an id/reference that can be retained with it through changes
            (!isMultiEnvironment && (envValue as any)?.envIdForValues
              ? (envValue as any)?.envIdForValues
              : envValue.environmentRef) === environmentIdentifier
        )
      : undefined

    const newEnvironmentObject = !isNil(existingValueOfEnvironment)
      ? existingValueOfEnvironment
      : ({} as EnvironmentYamlV2)

    let newEnvironmentInputs = newEnvironmentObject?.environmentInputs
    const environmentInputsFromEnvironmentData = valueFromEnvironmentsData?.environmentInputs

    const baseEnvironmentInputs = !isEmpty(environmentInputsFromEnvironmentData)
      ? deployToAllEnvironments && stepViewType === StepViewType.TemplateUsage
        ? environmentInputsFromEnvironmentData
        : clearRuntimeInput(environmentInputsFromEnvironmentData)
      : undefined

    if (!newEnvironmentInputs || isValueRuntimeInput(newEnvironmentInputs as unknown as string)) {
      newEnvironmentInputs = baseEnvironmentInputs
    } else {
      newEnvironmentInputs = merge(baseEnvironmentInputs, newEnvironmentInputs)
    }

    let newServiceOverrideInputs = newEnvironmentObject?.serviceOverrideInputs
    const serviceOverrideInputsFromEnvironmentData = !isEmpty(
      valueFromEnvironmentsData?.serviceOverrideInputs?.[environmentIdentifier]
    )
      ? valueFromEnvironmentsData?.serviceOverrideInputs?.[environmentIdentifier]?.[serviceIdentifiers[0]]
      : undefined

    const baseServiceOverrideInputs = !isEmpty(serviceOverrideInputsFromEnvironmentData)
      ? deployToAllEnvironments && stepViewType === StepViewType.TemplateUsage
        ? serviceOverrideInputsFromEnvironmentData
        : clearRuntimeInput(serviceOverrideInputsFromEnvironmentData)
      : undefined

    if (!newServiceOverrideInputs || isValueRuntimeInput(newServiceOverrideInputs as unknown as string)) {
      newServiceOverrideInputs = baseServiceOverrideInputs
    } else {
      newServiceOverrideInputs = merge(baseServiceOverrideInputs, newServiceOverrideInputs)
    }

    const deployToAll = isValueRuntimeInput(newEnvironmentObject?.deployToAll)
      ? (RUNTIME_INPUT_VALUE as any)
      : !!newEnvironmentObject?.deployToAll

    const infrastructureDefinitions = !isEmpty(newEnvironmentObject?.infrastructureDefinitions)
      ? // This condition marks the field as RUNTIME when used in templates
        deployToAllEnvironments && stepViewType === StepViewType.TemplateUsage
        ? newEnvironmentObject?.infrastructureDefinitions
        : isValueRuntimeInput(newEnvironmentObject?.infrastructureDefinitions as any)
        ? (RUNTIME_INPUT_VALUE as any)
        : newEnvironmentObject?.infrastructureDefinitions
      : undefined

    const gitOpsClusters = !isEmpty(newEnvironmentObject?.gitOpsClusters)
      ? // This condition marks the field as RUNTIME when used in templates
        deployToAllEnvironments && stepViewType === StepViewType.TemplateUsage
        ? newEnvironmentObject?.gitOpsClusters
        : isValueRuntimeInput(newEnvironmentObject?.infrastructureDefinitions as any)
        ? (RUNTIME_INPUT_VALUE as any)
        : newEnvironmentObject?.gitOpsClusters
      : undefined

    // End - Retain form values

    return {
      // This is to differentiate the object when the environment has changed
      ...(!isMultiEnvironment && { envIdForValues: environmentIdentifier }),
      environmentRef: environmentIdentifier,
      environmentInputs: newEnvironmentInputs,
      serviceOverrideInputs: newServiceOverrideInputs,
      deployToAll,
      ...(childEntity === 'gitOpsClusters' ? { gitOpsClusters } : { infrastructureDefinitions })
    }
  })
}
