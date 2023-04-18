/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import { isEmpty, set, get, defaultTo } from 'lodash-es'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { GoogleCloudFunctionsEnvType, ServiceDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import type {
  StepPalleteModuleInfo,
  StageElementConfig,
  StageElementWrapperConfig,
  StepElementConfig
} from 'services/pipeline-ng'
import {
  StepOrStepGroupOrTemplateStepData,
  TabTypes,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { sanitize } from '@common/utils/JSONUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { DeploymentStageElementConfigWrapper } from './pipelineTypes'

export enum StepMode {
  STAGE = 'STAGE',
  STEP_GROUP = 'STEP_GROUP',
  STEP = 'STEP'
}

export function isHarnessApproval(stepType?: string): boolean {
  return stepType === StepType.HarnessApproval
}

export function isJiraApproval(stepType?: string): boolean {
  return stepType === StepType.JiraApproval
}

export function isApprovalStep(stepType?: string): boolean {
  return isHarnessApproval(stepType) || isJiraApproval(stepType) || isServiceNowApproval(stepType)
}

export function isServiceNowApproval(stepType?: string): boolean {
  return stepType === StepType.ServiceNowApproval
}

export function getAllStepPaletteModuleInfos(): StepPalleteModuleInfo[] {
  return [
    {
      module: 'cd',
      shouldShowCommonSteps: false
    },
    {
      module: 'ci',
      shouldShowCommonSteps: true
    },
    {
      module: 'cv',
      shouldShowCommonSteps: false
    }
  ]
}

export function getStepPaletteModuleInfosFromStage(
  stageType?: string,
  stage?: StageElementConfig,
  initialCategory?: string,
  stages?: StageElementWrapperConfig[]
): StepPalleteModuleInfo[] {
  // When stage is propagated from other previous stage
  const propagateFromStageId = get(stage, 'spec.serviceConfig.useFromStage.stage', undefined)

  // deploymentType
  let deploymentType = get(
    stage,
    'spec.serviceConfig.serviceDefinition.type',
    get(stage, `spec.deploymentType`, undefined)
  )
  if (!deploymentType && stages?.length && propagateFromStageId) {
    const propagateFromStage = stages.find(
      currStage => (currStage as DeploymentStageElementConfigWrapper).stage.identifier === propagateFromStageId
    ) as DeploymentStageElementConfigWrapper
    deploymentType = get(
      propagateFromStage?.stage,
      'spec.serviceConfig.serviceDefinition.type',
      get(propagateFromStage?.stage, `spec.deploymentType`, undefined)
    )
  }

  // GoogleCloudFunctions - environmentType
  let environmentType = get(
    stage,
    'spec.serviceConfig.serviceDefinition.spec.environmentType',
    get(stage, `spec.deploymentMetadata.environmentType`, undefined)
  )
  if (!environmentType && stages?.length && propagateFromStageId) {
    const propagateFromStage = stages.find(
      currStage => (currStage as DeploymentStageElementConfigWrapper).stage.identifier === propagateFromStageId
    ) as DeploymentStageElementConfigWrapper
    environmentType = get(
      propagateFromStage?.stage,
      'spec.serviceConfig.serviceDefinition.spec.environmentType',
      get(propagateFromStage?.stage, `spec.deploymentMetadata.environmentType`, undefined)
    )
  }

  let category = initialCategory
  switch (deploymentType) {
    case 'Kubernetes':
      category = 'Kubernetes'
      break
    case 'NativeHelm':
      category = 'Helm'
      break
    case 'ServerlessAwsLambda':
      category = 'ServerlessAwsLambda'
      break
    case 'AzureWebApp':
      category = 'AzureWebApp'
      break
    case ServiceDeploymentType.ECS:
      category = 'ECS'
      break
    case ServiceDeploymentType.WinRm:
    case ServiceDeploymentType.Ssh:
      category = 'Commands'
      break
    case ServiceDeploymentType.CustomDeployment:
      category = 'CustomDeployment'
      break
    case ServiceDeploymentType.Asg:
      category = 'AutoScalingGroup'
      break
    case ServiceDeploymentType.GoogleCloudFunctions: {
      if (environmentType === GoogleCloudFunctionsEnvType.GenOne) {
        category = 'GoogleCloudFunctionsGenOne'
      } else {
        category = deploymentType
      }
      break
    }
    default:
      category = deploymentType
  }
  switch (stageType) {
    case StageType.BUILD:
      return [
        {
          module: 'ci',
          shouldShowCommonSteps: false
        }
      ]

    case StageType.FEATURE:
      return [
        {
          module: 'pms',
          category: 'FeatureFlag',
          shouldShowCommonSteps: true
        },
        {
          module: 'cv',
          shouldShowCommonSteps: false
        },
        {
          module: 'cd',
          category: 'Chaos',
          shouldShowCommonSteps: false
        }
      ]

    case StageType.SECURITY:
      return [
        {
          module: 'sto',
          shouldShowCommonSteps: false
        }
      ]
    case StageType.CUSTOM:
      return [
        {
          module: 'cd',
          category: 'Approval',
          shouldShowCommonSteps: true
        },
        {
          module: 'cd',
          category: 'Builds',
          shouldShowCommonSteps: false
        },
        {
          module: 'cd',
          category: 'Provisioner',
          shouldShowCommonSteps: false
        },
        {
          module: 'cd',
          category: 'Chaos',
          shouldShowCommonSteps: false
        }
      ]
    case StageType.DEPLOY: {
      const stepPalleteInfo =
        deploymentType === ServiceDeploymentType.CustomDeployment
          ? [
              {
                module: 'cd',
                category: category,
                shouldShowCommonSteps: true
              },
              {
                module: 'cd',
                category: 'Provisioner',
                shouldShowCommonSteps: false
              },
              {
                module: 'cd',
                category: 'Builds',
                shouldShowCommonSteps: false
              },
              {
                module: 'cv',
                shouldShowCommonSteps: false
              }
            ]
          : [
              {
                module: 'cd',
                category: category,
                shouldShowCommonSteps: true
              },
              {
                module: 'cd',
                category: 'Builds',
                shouldShowCommonSteps: false
              },
              {
                module: 'cv',
                shouldShowCommonSteps: false
              }
            ]
      stepPalleteInfo.push(
        {
          module: 'cd',
          category: 'Chaos',
          shouldShowCommonSteps: false
        },
        {
          module: 'pms',
          category: 'ssca',
          shouldShowCommonSteps: false
        }
      )
      return stepPalleteInfo
    }
    default:
      return [
        {
          module: 'cd',
          category: stageType === StageType.APPROVAL ? 'Approval' : category,
          shouldShowCommonSteps: true
        },
        {
          module: 'cv',
          shouldShowCommonSteps: false
        }
      ]
  }
}

export function getStepDataFromValues(
  item: Partial<Values>,
  initialValues: StepOrStepGroupOrTemplateStepData
): StepElementConfig {
  const processNode = produce(initialValues as StepElementConfig, node => {
    if (item.tab !== TabTypes.Advanced) {
      if ((item as StepElementConfig).description) {
        node.description = (item as StepElementConfig).description
      } else if (node.description) {
        delete node.description
      }
      if ((item as StepElementConfig).timeout) {
        node.timeout = (item as StepElementConfig).timeout
      } else if (node.timeout) {
        delete node.timeout
      }
      if ((item as StepElementConfig).spec) {
        node.spec = { ...(item as StepElementConfig).spec }
      }
    } else {
      if (item.when) {
        node.when = item.when
      }
      if (!isEmpty(item.delegateSelectors)) {
        set(node, 'spec.delegateSelectors', item.delegateSelectors)
      } else if (node.spec?.delegateSelectors) {
        delete node.spec.delegateSelectors
      }
      if (!isEmpty(item.strategy)) {
        node.strategy = item.strategy
      } else if (node.strategy) {
        delete node.strategy
      }
      if (!isEmpty(item?.policySets)) {
        set(node, 'enforce.policySets', item.policySets)
      } else if (node.enforce?.policySets) {
        delete node.enforce
      }
    }
    // default strategies can be present without having the need to click on Advanced Tab. For eg. in CV step.
    if (
      !isEmpty(item.failureStrategies) &&
      (Array.isArray(item.failureStrategies) || isValueRuntimeInput(item.failureStrategies))
    ) {
      node.failureStrategies = item.failureStrategies
    } else if (node.failureStrategies) {
      delete node.failureStrategies
    }
  })
  sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
  return processNode
}

const TEMPLATIZED_VIEWS = [StepViewType.DeploymentForm, StepViewType.InputSet, StepViewType.TemplateUsage]

export function isTemplatizedView(
  stepViewType?: StepViewType
): stepViewType is StepViewType.DeploymentForm | StepViewType.InputSet | StepViewType.TemplateUsage {
  return !!stepViewType && TEMPLATIZED_VIEWS.includes(stepViewType)
}

export type ConnectorRefType = { record?: ConnectorReferenceDTO; scope?: Scope }

export const getScopedConnectorValue = (selectedConnector: ConnectorRefType): string => {
  const { record, scope } = selectedConnector
  return scope && (scope === Scope.ORG || scope === Scope.ACCOUNT)
    ? `${scope}.${record?.identifier}`
    : defaultTo(record?.identifier, '')
}
