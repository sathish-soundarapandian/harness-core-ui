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
  isMultiEnvironment: boolean,
  childEntity: 'gitOpsClusters' | 'infrastructureDefinitions'
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

    const newChildEntityTemplate =
      existingTemplateOfEnvironment?.[childEntity] && Array.isArray(existingTemplateOfEnvironment?.[childEntity])
        ? existingTemplateOfEnvironment[childEntity]
        : (RUNTIME_INPUT_VALUE as any)

    return {
      envIdForTemplate: envId,
      environmentRef: RUNTIME_INPUT_VALUE,
      environmentInputs: newEnvironmentInputsTemplate,
      deployToAll: RUNTIME_INPUT_VALUE as any,
      ...(isMultiEnvironment ? { [childEntity]: newChildEntityTemplate } : {})
    }
  })
}

export const createEnvValues = (
  existingEnvironmentValues: EnvironmentYamlV2[],
  environmentIdentifiers: string[],
  environmentsData: EnvironmentData[],
  deployToAllEnvironments: boolean,
  childEntity: 'gitOpsClusters' | 'infrastructureDefinitions',
  stepViewType?: StepViewType
): EnvironmentYamlV2[] => {
  return environmentIdentifiers.map(environmentIdentifier => {
    const valueFromEnvironmentsData = environmentsData.find(
      envValue => getScopedValueFromDTO(envValue.environment) === environmentIdentifier
    )

    // Start - Retain form values

    const existingValueOfEnvironment = Array.isArray(existingEnvironmentValues)
      ? existingEnvironmentValues.find(envValue => envValue.environmentRef === environmentIdentifier)
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

    if (!newEnvironmentInputs) {
      newEnvironmentInputs = baseEnvironmentInputs
    } else {
      newEnvironmentInputs = merge(baseEnvironmentInputs, newEnvironmentInputs)
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
        : clearRuntimeInput(newEnvironmentObject?.infrastructureDefinitions)
      : undefined

    const gitOpsClusters = !isEmpty(newEnvironmentObject?.gitOpsClusters)
      ? // This condition marks the field as RUNTIME when used in templates
        deployToAllEnvironments && stepViewType === StepViewType.TemplateUsage
        ? newEnvironmentObject?.gitOpsClusters
        : isValueRuntimeInput(newEnvironmentObject?.infrastructureDefinitions as any)
        ? (RUNTIME_INPUT_VALUE as any)
        : clearRuntimeInput(newEnvironmentObject?.gitOpsClusters)
      : undefined

    // End - Retain form values

    return {
      environmentRef: environmentIdentifier,
      environmentInputs: newEnvironmentInputs,
      deployToAll,
      ...(childEntity === 'gitOpsClusters' ? { gitOpsClusters } : { infrastructureDefinitions })
    }
  })
}
