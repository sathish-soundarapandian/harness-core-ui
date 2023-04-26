/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
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

const getStepIdPaths = (
  stepsData: (ExecutionWrapperConfig | DependencyElement)[] | undefined,
  prefix: string
): string[] => {
  if (!Array.isArray(stepsData)) return []

  return stepsData
    .reduce<string[]>((paths, stepData) => {
      if ((stepData as ExecutionWrapperConfig)?.step?.identifier) {
        const stepId = (stepData as ExecutionWrapperConfig)?.step?.identifier as string
        paths.push(stepId)
      } else if ((stepData as ExecutionWrapperConfig)?.parallel) {
        paths.push(...getStepIdPaths((stepData as ExecutionWrapperConfig)?.parallel, ''))
      } else if ((stepData as ExecutionWrapperConfig)?.stepGroup) {
        const stepGroupIdentifier = (stepData as ExecutionWrapperConfig)?.stepGroup?.identifier as string
        paths.push(stepGroupIdentifier)
        paths.push(
          ...getStepIdPaths((stepData as ExecutionWrapperConfig)?.stepGroup?.steps, `${stepGroupIdentifier}.steps`)
        )
      } else {
        paths.push((stepData as DependencyElement)?.identifier as string)
      }
      return paths
    }, [])
    .map(path => (prefix ? `${prefix}.${path}` : path))
}

const getStagesToStepIdPaths = (stagesData: StageElementWrapperConfig[], prefix: string): string[] => {
  if (!Array.isArray(stagesData)) return []

  return stagesData
    .reduce<string[]>((paths, stageData) => {
      if (Array.isArray(stageData.parallel)) {
        paths.push(...getStagesToStepIdPaths(stageData.parallel, ''))
      } else if (stageData.stage) {
        const stageId = stageData.stage?.identifier
        paths.push(stageId)
        paths.push(
          ...getStepIdPaths(
            (stageData.stage?.spec as IntegrationStageConfigImpl)?.serviceDependencies,
            `${stageId}.spec.serviceDependencies`
          ),
          ...getStepIdPaths(stageData.stage?.spec?.execution?.steps, `${stageId}.spec.execution.steps`),
          ...getStepIdPaths(stageData.stage.spec?.execution?.rollbackSteps, `${stageId}.spec.execution.rollbackSteps`)
        )
      }
      return paths
    }, [])
    .map(path => (prefix ? `${prefix}.${path}` : path))
}

/** A step/step group/stage identifier is a duplicate if a unique path cannot be formed to the step/step group/stage identifier starting from pipeline.stages */
export const getDuplicateIdentifiers = (stagesData: StageElementWrapperConfig[]): string[] => {
  const allPaths = getStagesToStepIdPaths(stagesData, 'pipeline.stages')
  const uniqueDuplicates = [...new Set(allPaths.filter((e, i, a) => a.indexOf(e) !== i))]
  return uniqueDuplicates
}
