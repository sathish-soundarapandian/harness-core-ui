/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import type { AddDrawerMapInterface } from '@common/components/AddDrawer/AddDrawer'
import type { ExecutionWrapperConfig, StageElementWrapperConfig, StepCategory } from 'services/pipeline-ng'
import type { DependencyElement, IntegrationStageConfigImpl } from 'services/ci'
import { deployStageSteps } from './mock'

type iconMapOptions = {
  [key: string]: IconName
}

// Currently coming from PipelineContext
const stageTypes = {
  BUILD: 'ci',
  DEPLOY: 'Deployment'
}

export const iconMap: iconMapOptions = {
  Apply: 'main-code-yaml',
  Scale: 'swap-vertical',
  'Stage Deployment': 'pipeline-deploy',
  'K8s Rolling Rollback': 'rolling',
  'Swap Selectors': 'command-swap',
  Delete: 'main-trash',
  Deployment: 'main-canary',
  'Terraform Apply': 'service-terraform',
  'Terraform Provision': 'service-terraform',
  'Terraform Delete': 'service-terraform',
  'Create Stack': 'service-cloudformation',
  'Delete Stack': 'service-cloudformation',
  'Shell Script Provisioner': 'command-shell-script',
  Jira: 'service-jira',
  ServiceNow: 'service-servicenow',
  Email: 'command-email',
  Barriers: 'barrier-open',
  'New Relic Deployment Maker': 'service-newrelic',
  'Templatized Secret Manager': 'main-template-library',
  Run: 'run-step',
  'Restore Cache': 'restore-cache-step',
  'Save Cache': 'save-cache-step',
  'Git Clone': 'git-clone-step',
  // TODO: temp icons
  // >> start
  JIRA: 'service-jira',
  'Approval Step': 'command-approval',
  HTTP: 'command-http',
  Plugin: 'git-clone-step',
  ResourceConstraint: 'traffic-lights'
  // << end
}

// This is temporary, need to get types as above for icons
export const iconMapByName: iconMapOptions = {
  Kubernetes: 'service-kubernetes',
  'Infrastructure Provisioners': 'yaml-builder-env',
  'Issue Tracking': 'error',
  Notification: 'notifications',
  'Flow Control': 'flow-branch',
  Utilites: 'briefcase'
}

const addIconNameToItems = (drawerMap: StepCategory = {}) => {
  const newAddDrawerMap: any = { ...drawerMap }
  drawerMap.stepCategories?.forEach((stepCategory, cIndex) =>
    stepCategory?.stepsData?.forEach((stepData, dIndex) => {
      if (stepData.name) {
        newAddDrawerMap.stepCategories[cIndex].stepsData[dIndex].iconName = iconMap[stepData.name]
      }
    })
  )
  return newAddDrawerMap
}

export const getAddDrawerMap = (drawerMap: any, stageType: string): AddDrawerMapInterface => {
  if (stageType === stageTypes.BUILD || stageType === stageTypes.DEPLOY) {
    return addIconNameToItems(drawerMap)
  }
  return addIconNameToItems(drawerMap)
}
// const useGetBuildSteps = (props: UseGetStepsProps) =>
//   useGet<ResponseStepCategory, Failure | Error, GetStepsQueryParams, void>(`/pipelines/configuration/buildsteps`, {
//     base: getConfig('ng/api'),
//     ...props,
//     mock: { data: (buildStageSteps as unknown) as ResponseStepCategory }
//   })

export const getCategoryItems = (_stageType: string, _selectedStage: StageElementWrapperConfig | undefined) => {
  //   const serviceDefinitionType = get(selectedStage, 'stage.spec.service.serviceDefinition.type', 'Kubernetes')
  //   this was successful
  const { data } = deployStageSteps
  return data
  // todo: see if something wrong with qb and services
  //   if (stageType === stageTypes.BUILD) {
  //     const { data } = useGetBuildSteps({ queryParams: { serviceDefinitionType } })
  //     return data ? data : {}

  //     return data
  //   } else if (stageType === stageTypes.DEPLOY) {
  //     const { data } = useGetSteps({ queryParams: { serviceDefinitionType } })
  //     // handle if fetching error
  //     return data ? data : {}
  //     // const { data } = useGetSteps({ queryParams: { serviceDefinitionType } })
  //     // return data
  //   }
}

interface StageStepsIdMap {
  [key: string]: { steps: string[]; rollbackSteps: string[] }
}

const getStageStepsIdentifiers = (
  stageStepsData: ExecutionWrapperConfig[] | DependencyElement[] | undefined
): string[] => {
  const idMap = [] as string[]
  stageStepsData?.forEach((stepsData: ExecutionWrapperConfig | DependencyElement | undefined) => {
    if ((stepsData as ExecutionWrapperConfig)?.step) {
      idMap.push((stepsData as ExecutionWrapperConfig)?.step?.identifier as string)
    } else if ((stepsData as ExecutionWrapperConfig)?.parallel) {
      idMap.push(...getStageStepsIdentifiers((stepsData as ExecutionWrapperConfig)?.parallel))
    } else if ((stepsData as ExecutionWrapperConfig)?.stepGroup) {
      idMap.push((stepsData as ExecutionWrapperConfig)?.stepGroup?.identifier as string)
      idMap.push(...getStageStepsIdentifiers((stepsData as ExecutionWrapperConfig)?.stepGroup?.steps))
    } else {
      idMap.push((stepsData as DependencyElement)?.identifier as string)
    }
  })
  return idMap
}

export const getStageIdDetailsMapping = (stagesData: StageElementWrapperConfig[]): StageStepsIdMap => {
  let stageStepsMapping = {} as StageStepsIdMap
  stagesData?.forEach(stageData => {
    if ((stageData as StageElementWrapperConfig)?.parallel) {
      stageStepsMapping = {
        ...stageStepsMapping,
        ...getStageIdDetailsMapping(defaultTo((stageData as StageElementWrapperConfig).parallel, []))
      }
    } else if ((stageData as StageElementWrapperConfig)?.stage) {
      const stageId = (stageData as StageElementWrapperConfig)?.stage?.identifier as string
      const localStageSteps = { steps: [] as string[], rollbackSteps: [] as string[] }
      // Execution CI serviceDependencies
      localStageSteps.steps.push(
        ...getStageStepsIdentifiers((stageData?.stage?.spec as IntegrationStageConfigImpl)?.serviceDependencies)
      )
      // Execution steps
      localStageSteps.steps.push(
        ...getStageStepsIdentifiers((stageData as StageElementWrapperConfig)?.stage?.spec?.execution?.steps)
      )
      // Execution rollback steps
      localStageSteps.rollbackSteps.push(
        ...getStageStepsIdentifiers((stageData as StageElementWrapperConfig)?.stage?.spec?.execution?.rollbackSteps)
      )
      // Saving stepsId against stage identifier
      stageStepsMapping[stageId] = localStageSteps
    }
  })
  return stageStepsMapping
}
