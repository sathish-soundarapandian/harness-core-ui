import { defaultTo } from 'lodash-es'
import { RUNTIME_INPUT_VALUE, MultiTypeInputType } from '@harness/uicore'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { StageElementConfig } from 'services/pipeline-ng'
import type { InfraStructureDefinitionYaml, DeploymentStageConfig, EnvironmentYamlV2 } from 'services/cd-ng'

import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/StepUtil'

interface EnvironmentYamlV2Runtime extends Omit<EnvironmentYamlV2, 'infrastructureDefinitions'> {
  infrastructureDefinitions?: InfraStructureDefinitionYaml[] | string
}

interface DeploymentStageConfigAzureWebName extends Omit<DeploymentStageConfig, 'environment'> {
  environment: EnvironmentYamlV2Runtime
}

export interface DeploymentStageElementConfigAzureWebName extends Omit<StageElementConfig, 'spec'> {
  spec?: DeploymentStageConfigAzureWebName
}
export type SelectedStageType = StageElementWrapper<DeploymentStageElementConfigAzureWebName>

export const isRuntimeEnvId = (selectedStage: SelectedStageType): boolean => {
  const envId = selectedStage?.stage?.spec?.environment?.environmentRef
  return !!(envId && envId === RUNTIME_INPUT_VALUE)
}

export const isRuntimeInfraId = (selectedStage: SelectedStageType): boolean => {
  const infraId = selectedStage?.stage?.spec?.environment?.infrastructureDefinitions
  return infraId === RUNTIME_INPUT_VALUE
}

export const isMultiEnv = (selectedStage: SelectedStageType): boolean => {
  const isEnvs = !!selectedStage?.stage?.spec?.environments || !!selectedStage?.stage?.spec?.environmentGroup
  return !!isEnvs
}

export const getEnvId = (selectedStage: SelectedStageType): string => {
  if (isMultiEnv(selectedStage || isRuntimeEnvId(selectedStage))) {
    return ''
  }

  return defaultTo(selectedStage?.stage?.spec?.environment?.environmentRef, '')
}

export const getInfraId = (selectedStage: SelectedStageType): string => {
  const envId = getEnvId(selectedStage)
  if (!envId || isMultiEnv(selectedStage)) {
    return ''
  }

  if (!isRuntimeEnvId(selectedStage) && !isRuntimeInfraId(selectedStage)) {
    const [infra] = selectedStage?.stage?.spec?.environment?.infrastructureDefinitions as InfraStructureDefinitionYaml[]
    return infra.identifier
  }

  return ''
}

export const getEnvIdRuntime = (stageId: string, values: any) => {
  const stage = getStageFromPipeline(stageId, values) as SelectedStageType
  const envId = stage?.stage?.spec?.environment?.environmentRef
  return envId
}

export const getInfraIdRuntime = (stageId: string, values: any): string => {
  const stage = getStageFromPipeline(stageId, values) as SelectedStageType

  if (stage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]) {
    const [{ identifier }] = stage?.stage?.spec?.environment
      ?.infrastructureDefinitions as InfraStructureDefinitionYaml[]
    return identifier
  }
  return ''
}

export const getAllowableTypes = (selectedStage: SelectedStageType): MultiTypeInputType[] => {
  if (isMultiEnv(selectedStage)) {
    return [MultiTypeInputType.EXPRESSION]
  }

  return [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
}
