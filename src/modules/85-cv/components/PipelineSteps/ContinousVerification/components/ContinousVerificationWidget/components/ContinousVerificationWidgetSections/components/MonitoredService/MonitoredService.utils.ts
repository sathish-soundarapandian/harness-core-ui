/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { HealthSource, MonitoredServiceDTO } from 'services/cv'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig } from 'services/pipeline-ng'

export const getNewSpecs = (
  monitoredServiceData: MonitoredServiceDTO | undefined,
  formValues: ContinousVerificationData
): ContinousVerificationData['spec'] => {
  const healthSources =
    monitoredServiceData?.sources?.healthSources?.map(el => {
      return { identifier: (el as HealthSource)?.identifier as string }
    }) || []

  return { ...formValues.spec, monitoredServiceRef: monitoredServiceData?.identifier, healthSources }
}

export const isAnExpression = (value: string): boolean => {
  return value?.startsWith('<+') || (value?.startsWith('<') && value !== RUNTIME_INPUT_VALUE)
}

export const getServiceIdFromStage = (stage: StageElementWrapper<DeploymentStageElementConfig>): string => {
  return (
    stage?.stage?.spec?.serviceConfig?.service?.identifier ||
    stage?.stage?.spec?.serviceConfig?.serviceRef ||
    stage?.stage?.spec?.service?.serviceRef ||
    ''
  )
}

export function getServiceIdentifierFromStage(
  selectedStage: StageElementWrapper<DeploymentStageElementConfig> | undefined,
  pipeline: PipelineInfoConfig
): string {
  let serviceId = ''
  const stageFromServiceConfig = selectedStage?.stage?.spec?.serviceConfig?.useFromStage
  const stageFromService = selectedStage?.stage?.spec?.service?.useFromStage

  if (stageFromServiceConfig || stageFromService) {
    const stageIdToDeriveServiceFrom = stageFromServiceConfig?.stage || stageFromService?.stage
    const stageToDeriveServiceFrom = pipeline?.stages?.find(el => el?.stage?.identifier === stageIdToDeriveServiceFrom)
    serviceId = getServiceIdFromStage(stageToDeriveServiceFrom as StageElementWrapper<DeploymentStageElementConfig>)
  } else {
    serviceId = getServiceIdFromStage(selectedStage as StageElementWrapper<DeploymentStageElementConfig>)
  }
  return serviceId
}

export function getEnvironmentIdentifierFromStage(
  selectedStage?: StageElementWrapper<DeploymentStageElementConfig>
): string {
  return (
    selectedStage?.stage?.spec?.infrastructure?.environment?.identifier ||
    selectedStage?.stage?.spec?.infrastructure?.environmentRef ||
    selectedStage?.stage?.spec?.environment?.environmentRef ||
    ''
  )
}

export function isFirstTimeOpenForDefaultMonitoredSvc(
  formValues: ContinousVerificationData,
  monitoredServiceData: MonitoredServiceDTO | undefined
): boolean {
  return !!(
    !formValues?.spec?.monitoredServiceRef &&
    !formValues?.spec?.monitoredService?.spec?.monitoredServiceRef &&
    monitoredServiceData?.identifier
  )
}
