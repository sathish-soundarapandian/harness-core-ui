/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { isEmpty } from 'lodash-es'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

export enum DeployTabs {
  OVERVIEW = 'OVERVIEW',
  SERVICE = 'SERVICE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ENVIRONMENT = 'ENVIRONMENT',
  EXECUTION = 'EXECUTION',
  ADVANCED = 'ADVANCED'
}

export const isEmptyServiceConfigPath = (stage: DeploymentStageElementConfig): boolean => {
  return (
    isEmpty(stage?.spec?.serviceConfig?.serviceDefinition?.type) && isEmpty(stage?.spec?.serviceConfig?.useFromStage)
  )
}
export const isEmptyInfraPath = (stage: DeploymentStageElementConfig): boolean => {
  return isEmpty(stage?.spec?.infrastructure)
}
export const isNewServiceEnvEntity = (isSvcEnvEntityEnabled: boolean, stage: DeploymentStageElementConfig): boolean => {
  return isSvcEnvEntityEnabled && isEmptyServiceConfigPath(stage)
}
export enum ExecutionType {
  BASIC = 'Basic',
  CANARY = 'Canary',
  ROLLING = 'Rolling',
  GITOPS = 'GitOps',
  DEFAULT = 'Default'
}

export const isNewEnvInfraDef = (isSvcEnvEntityEnabled: boolean, stage: DeploymentStageElementConfig): boolean => {
  return isSvcEnvEntityEnabled && isEmptyInfraPath(stage)
}
