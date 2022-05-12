/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isNil } from 'lodash-es'
import { InfraDeploymentType } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { Infrastructure } from 'services/cd-ng'

const DEFAULT_RELEASE_NAME = 'release-<+INFRA_KEY>'

export const cleanUpEmptyProvisioner = (
  stageData: StageElementWrapper<DeploymentStageElementConfig> | undefined
): boolean => {
  const provisioner = stageData?.stage?.spec?.infrastructure?.infrastructureDefinition?.provisioner
  let isChanged = false

  if (!isNil(provisioner?.steps) && provisioner?.steps.length === 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete provisioner.steps
    isChanged = true
  }
  if (!isNil(provisioner?.rollbackSteps) && provisioner?.rollbackSteps.length === 0) {
    delete provisioner.rollbackSteps
    isChanged = true
  }

  if (
    !provisioner?.steps &&
    !provisioner?.rollbackSteps &&
    stageData?.stage?.spec?.infrastructure?.infrastructureDefinition?.provisioner
  ) {
    delete stageData.stage.spec.infrastructure.infrastructureDefinition.provisioner
    isChanged = true
  }

  return isChanged
}

export const getInfrastructureDefaultValue = (
  stageData: StageElementWrapper | undefined,
  infrastructureType: string | undefined
): Infrastructure => {
  const infrastructure = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition', null)
  const type = defaultTo(infrastructure?.type, infrastructureType)
  const allowSimultaneousDeployments = get(stageData, 'stage.spec.infrastructure.allowSimultaneousDeployments', false)
  switch (type) {
    case InfraDeploymentType.KubernetesDirect: {
      const connectorRef = infrastructure?.spec?.connectorRef
      const namespace = infrastructure?.spec?.namespace
      const releaseName = infrastructure?.spec?.releaseName ?? DEFAULT_RELEASE_NAME
      return {
        connectorRef,
        namespace,
        releaseName,
        allowSimultaneousDeployments
      }
    }
    case InfraDeploymentType.KubernetesGcp: {
      const connectorRef = infrastructure?.spec?.connectorRef
      const namespace = infrastructure?.spec?.namespace
      const releaseName = infrastructure?.spec?.releaseName ?? DEFAULT_RELEASE_NAME
      const cluster = infrastructure?.spec?.cluster

      return {
        connectorRef,
        namespace,
        releaseName,
        cluster,
        allowSimultaneousDeployments
      }
    }
    case InfraDeploymentType.ServerlessAwsLambda: {
      const connectorRef = infrastructure?.spec?.connectorRef
      const region = infrastructure?.spec?.region
      const infraStage = infrastructure?.spec?.stage

      return {
        connectorRef,
        region,
        stage: infraStage,
        allowSimultaneousDeployments
      }
    }
    case InfraDeploymentType.ServerlessAzureFunctions:
    case InfraDeploymentType.ServerlessGoogleFunctions: {
      const connectorRef = infrastructure?.spec?.connectorRef
      const infraStage = infrastructure?.spec?.stage

      return {
        connectorRef,
        stage: infraStage,
        allowSimultaneousDeployments
      }
    }
    case InfraDeploymentType.KubernetesAzure: {
      const connectorRef = infrastructure?.spec?.connectorRef
      const subscriptionId = infrastructure?.spec?.subscriptionId
      const resourceGroup = infrastructure?.spec?.resourceGroup
      const cluster = infrastructure?.spec?.cluster
      const namespace = infrastructure?.spec?.namespace
      const releaseName = infrastructure?.spec?.releaseName ?? DEFAULT_RELEASE_NAME

      return {
        connectorRef,
        namespace,
        subscriptionId,
        resourceGroup,
        cluster,
        releaseName,
        allowSimultaneousDeployments
      }
    }
    default: {
      return {}
    }
  }
}
