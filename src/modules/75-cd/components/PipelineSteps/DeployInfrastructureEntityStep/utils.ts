/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty, isNil, merge } from 'lodash-es'

import type { InfraStructureDefinitionYaml } from 'services/cd-ng'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'

import type { InfrastructureData } from '../DeployEnvironmentEntityStep/types'

export const createInfraTemplate = (
  existingTemplate: InfraStructureDefinitionYaml[],
  infrastructureIdentifiers: string[],
  infrastructuresData: InfrastructureData[]
): InfraStructureDefinitionYaml[] => {
  return infrastructureIdentifiers.map(infraIdentifier => {
    const existingTemplateOfInfrastructure = Array.isArray(existingTemplate)
      ? existingTemplate.find(infraTemplate => (infraTemplate as any).infraIdForTemplate === infraIdentifier)
      : undefined

    const templateFromInfrastructureData = infrastructuresData.find(
      infraTemplate => infraTemplate.infrastructureDefinition.identifier === infraIdentifier
    )

    const newInputsTemplate = defaultTo(
      existingTemplateOfInfrastructure?.inputs,
      templateFromInfrastructureData?.infrastructureInputs
    )

    return {
      identifier: infraIdentifier,
      inputs: newInputsTemplate
    }
  })
}

export const createInfraValues = (
  existingInfrastructureValues: InfraStructureDefinitionYaml[],
  infrastructureIdentifiers: string[],
  infrastructuresData: InfrastructureData[],
  deployToAllInfrastructures: boolean,
  stepViewType?: StepViewType
): InfraStructureDefinitionYaml[] => {
  return infrastructureIdentifiers.map(infraId => {
    const valueFromInfrastructuresData = infrastructuresData.find(
      infraTemplate => infraTemplate.infrastructureDefinition.identifier === infraId
    )?.infrastructureInputs

    // Start - Retain form values

    const existingValueOfInfrastructure = Array.isArray(existingInfrastructureValues)
      ? existingInfrastructureValues.find(infraValue => infraValue.identifier === infraId)
      : undefined

    const newInfrastructureObject = !isNil(existingValueOfInfrastructure)
      ? existingValueOfInfrastructure
      : ({} as InfraStructureDefinitionYaml)

    let infrastructureInputs = newInfrastructureObject.inputs
    const infrastructureInputsFromInfrastructureData = valueFromInfrastructuresData?.inputs

    const baseInfrastructureInputs = !isEmpty(infrastructureInputsFromInfrastructureData)
      ? deployToAllInfrastructures && stepViewType === StepViewType.TemplateUsage
        ? infrastructureInputsFromInfrastructureData
        : clearRuntimeInput(infrastructureInputsFromInfrastructureData)
      : undefined

    if (!infrastructureInputs) {
      infrastructureInputs = baseInfrastructureInputs
    } else {
      infrastructureInputs = merge(baseInfrastructureInputs, infrastructureInputs)
    }

    // End - Retain form values

    return {
      identifier: infraId,
      inputs: infrastructureInputs
    }
  })
}
